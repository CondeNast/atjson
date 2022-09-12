import {
  BlockAnnotation,
  Document,
  EdgeBehaviour,
  ObjectAnnotation,
  ParseAnnotation,
  JSON,
  Annotation,
  UnknownAnnotation,
  AnnotationConstructor,
  is,
} from "./internals";

/**
 * Offset ranges are encoded as a string that
 * contains range information including
 * inclusive / exclusive boundaries.
 *
 * See [Peritext](https://www.inkandswitch.com/peritext/#generating-inline-formatting-operations)
 * for context on boundary information with marks.
 * If you wanted to line up this syntax with what
 * Peritext uses, `[|]` is the same as `"before"` and
 * `(|)` is the same as `"after"`. The brackets are
 * commonly used in domain / ranges in math equations,
 * and are reused here to coincide with how
 * automerge stores this information.
 */
type Range = `${"[" | "("}${number}..${number}${"]" | ")"}`;

/**
 * A mark is
 */
type Mark = {
  id: string;
  type: string;
  range: Range;
  attributes: JSON;
};

/**
 * A block is used
 */
type Block = {
  id: string;
  type: string;
  parents: string[];
  selfClosing?: boolean;
  attributes: JSON;
};

// @blaine and @tim-evans have been doing explorations
// on what it would mean to have deeper integration with
// automerge, especially since there's been a lot of
// work done on automerge's Text type which now closely
// mirrors atjson's structure.
//
// To aid compatibility with this, and to make it easier
// for newcomers to understand what's going on in the document.
// This format is compact and solves problems that ended
// up being hacks in atjson where we used parse tokens
// to handle ambiguous cases with object annotations and
// block annotations.
type StorageFormat = {
  text: string;
  blocks?: Block[];
  marks?: Mark[];
};

function parseRange(range: Range) {
  let match = range.match(/([[|(])(\d+)\.\.(\d+)([\]|)])/);
  if (match == null) {
    throw new Error(`Malformed range ${range}`);
  }
  return {
    start: parseInt(match[2]),
    end: parseInt(match[3]),
    edgeBehaviour: {
      leading: match[1] === "(" ? EdgeBehaviour.preserve : EdgeBehaviour.modify,
      trailing:
        match[4] === ")" ? EdgeBehaviour.preserve : EdgeBehaviour.modify,
    },
  };
}

function serializeRange(
  start: number,
  end: number,
  edgeBehaviour: { leading: EdgeBehaviour; trailing: EdgeBehaviour }
) {
  return `${
    edgeBehaviour.leading === EdgeBehaviour.preserve ? "(" : "["
  }${start}..${end}${
    edgeBehaviour.trailing === EdgeBehaviour.preserve ? ")" : "]"
  }` as Range;
}

enum TokenType {
  BLOCK_START,
  BLOCK_END,
  MARK_START,
  MARK_END,
  PARSE_START,
  PARSE_END,
}

const START_TOKENS = [
  TokenType.BLOCK_START,
  TokenType.MARK_START,
  TokenType.PARSE_START,
];

export function serialize(
  doc: Document,
  options?: { withStableIds: boolean }
): StorageFormat {
  // Blocks and object annotations are both stored
  // as blocks in this format. Blocks are aligned
  // with a single text character and close when
  // another block starts or the document ends.
  //
  // In automerge, the list of text contains the blocks
  // directly:
  //
  // ```json
  // [
  //  { "id": "a1", "type": "paragraph" },
  //  "h", "e", "l", "l", "o",
  //  { "id": "a2", "type": "paragraph" }
  // ]
  // ```
  //
  // If there is nesting of blocks, like in lists,
  // it will specify a `parent`:
  //
  // ```json
  // [
  //  { "id": "a1", "type": "paragraph" },
  //  "h", "i",
  //  { "id": "a2", "type": "emoji", "parent": "a1" }
  // ]
  //
  // Our flat-pack format will store blocks sequentially
  // in a list and use `\uFFFC` as placeholders. This
  // means the first example will look like:
  //
  // ```json
  // {
  //   "text": "\uFFFChello\uFFFC",
  //   "blocks": [
  //     { id: "a1", type: "paragraph" },
  //     { id: "a2", type: "paragraph" }
  //   ]
  // }
  let text = "";
  let blocks: Block[] = [];
  let marks: Mark[] = [];

  let tokens: {
    type: TokenType;
    index: number;
    annotation: Annotation<any>;
    shared: { start: number };
    edgeBehaviour: { leading: EdgeBehaviour; trailing: EdgeBehaviour };
  }[] = [];

  for (let annotation of doc.annotations) {
    let types: [TokenType, TokenType] = is(annotation, ParseAnnotation)
      ? [TokenType.PARSE_START, TokenType.PARSE_END]
      : annotation instanceof BlockAnnotation ||
        annotation instanceof ObjectAnnotation
      ? [TokenType.BLOCK_START, TokenType.BLOCK_END]
      : [TokenType.MARK_START, TokenType.MARK_END];
    let edgeBehaviour = annotation.getAnnotationConstructor().edgeBehaviour;
    let shared = { start: -1 };
    tokens.push(
      {
        type: types[0],
        index: annotation.start,
        annotation,
        shared,
        edgeBehaviour,
      },
      {
        type: types[1],
        index: annotation.end,
        annotation,
        shared,
        edgeBehaviour,
      }
    );
  }

  tokens.sort(function sortTokens(a, b) {
    let indexDelta = a.index - b.index;
    if (indexDelta !== 0) {
      return indexDelta;
    }

    // Sort end tokens before start tokens
    if (
      START_TOKENS.indexOf(a.type) !== -1 &&
      START_TOKENS.indexOf(b.type) === -1
    ) {
      return 1;
    }

    let startDelta = b.annotation.start - a.annotation.start;
    if (startDelta !== 0) {
      return startDelta;
    }
    let endDelta = b.annotation.end - a.annotation.end;
    if (endDelta !== 0) {
      return endDelta;
    }
    let rankDelta = a.annotation.rank - b.annotation.rank;
    if (rankDelta !== 0) {
      return rankDelta;
    }
    return a.type > b.type ? 1 : a.type < b.type ? -1 : 0;
  });

  // Provide stable ids
  let blockCounter = 0;
  let markCounter = 0;
  let withStableIds = options?.withStableIds ?? false;
  let ids: Record<string, string> = {};
  if (withStableIds) {
    for (let token of tokens) {
      switch (token.type) {
        case TokenType.BLOCK_START: {
          let id = token.annotation.id;
          if (withStableIds) {
            id = (blockCounter++).toString(16);
            id = `B${"00000000".slice(id.length) + id}`;
          }
          ids[token.annotation.id] = id;
          break;
        }
        case TokenType.MARK_START: {
          let id = token.annotation.id;
          if (withStableIds) {
            id = (markCounter++).toString(16);
            id = `M${"00000000".slice(id.length) + id}`;
          }
          ids[token.annotation.id] = id;
        }
      }
    }
  }

  let blockStack: Annotation[] = [];
  let lastIndex = 0;
  let parseTokenMutex = 0;
  for (let token of tokens) {
    if (parseTokenMutex === 0) {
      text += doc.content.slice(lastIndex, token.index);
    }
    lastIndex = token.index;

    switch (token.type) {
      case TokenType.BLOCK_START: {
        let annotation = withStableIds
          ? token.annotation.withStableIds(ids)
          : token.annotation;

        blocks.push({
          id: annotation.id,
          type: annotation.type,
          parents: blockStack.map((stack) => stack.type),
          selfClosing: annotation instanceof ObjectAnnotation,
          attributes: annotation.attributes,
        });
        blockStack.push(token.annotation);
        text += "\uFFFC";
        break;
      }
      case TokenType.BLOCK_END: {
        blockStack.pop();
        break;
      }
      case TokenType.MARK_START: {
        token.shared.start = text.length;
        break;
      }
      case TokenType.MARK_END: {
        let annotation = withStableIds
          ? token.annotation.withStableIds(ids)
          : token.annotation;

        marks.push({
          id: annotation.id,
          type: annotation.type,
          range: serializeRange(
            token.shared.start,
            text.length,
            token.edgeBehaviour
          ),
          attributes: annotation.attributes,
        });
        break;
      }
      case TokenType.PARSE_START: {
        parseTokenMutex++;
        break;
      }
      case TokenType.PARSE_END: {
        parseTokenMutex--;
        break;
      }
    }
  }
  text += doc.content.slice(lastIndex);

  return {
    text,
    blocks,
    marks,
  };
}

function offsetsForBlock(
  blocks: Block[],
  index: number,
  positions: number[],
  AnnotationClass: AnnotationConstructor<any, any> | null
) {
  let start = index;
  let block = blocks[index];
  // Short circuit for ObjectAnnotations
  if (AnnotationClass?.prototype.rank === ObjectAnnotation.prototype.rank) {
    return {
      start: positions[start],
      end: positions[index] + 1,
    };
  }

  let nextBlock = blocks[index++];
  while (nextBlock?.parents[nextBlock?.parents.length - 1] !== block.type) {
    nextBlock = blocks[index++];
  }

  return {
    start: positions[start],
    end: positions[index],
  };
}

function schemaForItem(item: Mark | Block, DocumentClass: typeof Document) {
  let schema = DocumentClass.schema;
  for (let AnnotationClass of schema) {
    if (AnnotationClass.type === item.type) {
      return AnnotationClass;
    }
  }
  return null;
}

export function deserialize(
  json: StorageFormat,
  DocumentClass: typeof Document
) {
  let annotations: Annotation<any>[] = [];
  let blocks = json.blocks ?? [];
  let marks = json.marks ?? [];

  let positions: number[] = [];
  let blockIndex = json.text.indexOf("\uFFFC");
  while (blockIndex !== -1) {
    positions.push(blockIndex);
    blockIndex = json.text.indexOf("\uFFFC", blockIndex);
  }
  positions.push(json.text.length);

  for (let i = 0, len = positions.length - 1; i < len; i++) {
    let block = blocks[i];
    let AnnotationClass = schemaForItem(block, DocumentClass);
    let position = offsetsForBlock(blocks, i, positions, AnnotationClass);
    annotations.push(
      new ParseAnnotation({
        start: positions[i],
        end: positions[i] + 1,
      })
    );
    if (AnnotationClass === null) {
      annotations.push(
        new UnknownAnnotation({
          id: block.id,
          ...position,
          attributes: {
            type: block.type,
            attributes: block.attributes,
          },
        })
      );
    } else {
      annotations.push(
        new AnnotationClass({
          id: block.id,
          ...position,
          attributes: block.attributes,
        })
      );
    }
  }

  for (let mark of marks) {
    let AnnotationClass = schemaForItem(mark, DocumentClass);
    let { start, end } = parseRange(mark.range);
    if (AnnotationClass == null) {
      annotations.push(
        new UnknownAnnotation({
          id: mark.id,
          start,
          end,
          attributes: {
            type: mark.type,
            attributes: mark.attributes,
          },
        })
      );
    } else {
      annotations.push(
        new AnnotationClass({
          id: mark.id,
          start,
          end,
          attributes: mark.attributes,
        })
      );
    }
  }

  return new DocumentClass({
    content: json.text,
    annotations: annotations,
  });
}
