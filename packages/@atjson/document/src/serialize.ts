import {
  BlockAnnotation,
  Document,
  EdgeBehaviour,
  ObjectAnnotation,
  ParseAnnotation,
  JSON,
  Annotation,
  UnknownAnnotation,
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

class Text extends BlockAnnotation {
  static vendorPrefix = "atjson";
  static type = "text";
}

class Root extends BlockAnnotation {
  static vendorPrefix = "atjson";
  static type = "root";
}

type Token = {
  type: TokenType;
  index: number;
  annotation: Annotation<any>;
  shared: { start: number };
  selfClosing: boolean;
  edgeBehaviour: { leading: EdgeBehaviour; trailing: EdgeBehaviour };
};

function sortTokens(a: Token, b: Token) {
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
  } else if (
    START_TOKENS.indexOf(a.type) === -1 &&
    START_TOKENS.indexOf(b.type) !== -1
  ) {
    return -1;
  }
  let multiplier = START_TOKENS.indexOf(a.type) === -1 ? -1 : 1;

  let startDelta = b.annotation.start - a.annotation.start;
  if (startDelta !== 0) {
    return startDelta * multiplier;
  }
  let endDelta = b.annotation.end - a.annotation.end;
  if (endDelta !== 0) {
    return endDelta * multiplier;
  }
  let rankDelta = a.annotation.rank - b.annotation.rank;
  if (rankDelta !== 0) {
    return rankDelta * multiplier;
  }
  return a.annotation.type > b.annotation.type
    ? multiplier * -1
    : a.annotation.type < b.annotation.type
    ? multiplier
    : 0;
}

function sortMarks(a: Mark, b: Mark) {
  let rangeA = parseRange(a.range);
  let rangeB = parseRange(b.range);

  // Sort by start position first
  let startDelta = rangeA.start - rangeB.start;
  if (startDelta !== 0) {
    return startDelta;
  }

  // If the start positions match,
  // sort by where the range edge starts
  if (rangeA.edgeBehaviour.leading !== rangeB.edgeBehaviour.leading) {
    return rangeA.edgeBehaviour.leading === EdgeBehaviour.modify ? -1 : 1;
  }

  // Then by the end position
  let endDelta = rangeA.end - rangeB.end;
  if (endDelta !== 0) {
    return endDelta;
  }

  // Then by the range edge
  if (rangeA.edgeBehaviour.trailing !== rangeB.edgeBehaviour.trailing) {
    return rangeA.edgeBehaviour.trailing === EdgeBehaviour.modify ? 1 : -1;
  }

  // Finally by type
  if (a.type !== b.type) {
    return a.type < b.type ? -1 : 1;
  }
  return 0;
}

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

  let root = new Root({
    start: 0,
    end: doc.content.length,
  });
  let shared = { start: -1 };
  let tokens: Token[] = [
    {
      type: TokenType.BLOCK_START,
      index: root.start,
      annotation: root,
      shared,
      selfClosing: false,
      edgeBehaviour: Root.edgeBehaviour,
    },
  ];

  for (let annotation of doc.annotations) {
    let isBlockAnnotation = annotation instanceof BlockAnnotation;
    let isObjectAnnotation = annotation instanceof ObjectAnnotation;
    let types: [TokenType, TokenType] = is(annotation, ParseAnnotation)
      ? [TokenType.PARSE_START, TokenType.PARSE_END]
      : isBlockAnnotation || isObjectAnnotation
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
        selfClosing: isObjectAnnotation,
        edgeBehaviour,
      },
      {
        type: types[1],
        index: annotation.end,
        annotation,
        shared,
        selfClosing: isObjectAnnotation,
        edgeBehaviour,
      }
    );
  }

  tokens.sort(sortTokens);

  tokens.push({
    type: TokenType.BLOCK_END,
    index: root.end,
    annotation: root,
    shared,
    selfClosing: false,
    edgeBehaviour: Root.edgeBehaviour,
  });

  // We're using a backtracking algorithm
  // to insert text blocks here.
  //
  // The approach is:
  // For every block boundary, if the
  // boundaries between the blocks are
  // not filled, wrap that range in block.
  let previousBlockBoundary: Token = tokens[tokens.length - 1];
  let parseTokens: Token[] = [];
  let textLength = 0;
  let lastIndex = previousBlockBoundary.index;
  for (let i = tokens.length - 1; i >= 0; i--) {
    let token = tokens[i];
    if (parseTokens.length === 0) {
      textLength += lastIndex - token.index;
    }
    lastIndex = token.index;
    if (token.selfClosing) continue;
    switch (token.type) {
      case TokenType.PARSE_END: {
        parseTokens.push(token);
        break;
      }
      case TokenType.PARSE_START: {
        parseTokens.splice(parseTokens.indexOf(token), 1);
        break;
      }
      case TokenType.BLOCK_START:
      case TokenType.BLOCK_END: {
        if (
          textLength > 0 &&
          ((previousBlockBoundary.type === token.type &&
            token.type === TokenType.BLOCK_END &&
            previousBlockBoundary.index > token.index) ||
            (previousBlockBoundary.index > token.index &&
              is(token.annotation, Root) &&
              token.type === TokenType.BLOCK_START))
        ) {
          // Insert text block
          let text = new Text({
            start: token.index,
            end: previousBlockBoundary.index,
          });
          let shared = { start: -1 };
          let index = tokens.indexOf(previousBlockBoundary);
          tokens.splice(index - 1, 0, {
            type: TokenType.BLOCK_END,
            index: text.end,
            annotation: text,
            selfClosing: false,
            shared,
            edgeBehaviour: Text.edgeBehaviour,
          });
          tokens.splice(i + 1, 0, {
            type: TokenType.BLOCK_START,
            index: text.start,
            annotation: text,
            selfClosing: false,
            shared,
            edgeBehaviour: Text.edgeBehaviour,
          });
        }
        textLength = 0;
        previousBlockBoundary = token;
        break;
      }
    }
  }

  // Remove root blocks
  for (let i = tokens.length - 1; i >= 0; i--) {
    if (is(tokens[i].annotation, Root)) {
      tokens.splice(i, 1);
      break;
    }
  }
  for (let i = 0, len = tokens.length; i < len; i++) {
    if (is(tokens[i].annotation, Root)) {
      tokens.splice(i, 1);
      break;
    }
  }
  tokens.sort(sortTokens);

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

  let parents: string[] = [];
  parseTokens = [];
  lastIndex = 0;
  for (let token of tokens) {
    if (parseTokens.length === 0) {
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
          parents: [...parents],
          selfClosing: token.selfClosing,
          attributes: annotation.attributes,
        });
        parents.push(token.annotation.type);
        text += "\uFFFC";
        break;
      }
      case TokenType.BLOCK_END: {
        parents.pop();
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
        parseTokens.push(token);
        break;
      }
      case TokenType.PARSE_END: {
        parseTokens.splice(parseTokens.indexOf(token), 1);
        break;
      }
    }
  }
  marks.sort(sortMarks);

  return {
    text,
    blocks,
    marks,
  };
}

function offsetsForBlock(blocks: Block[], index: number, positions: number[]) {
  let start = index;
  let block = blocks[index];
  if (block.selfClosing) {
    return {
      start: positions[start],
      end: positions[index] + 1,
    };
  }

  let nextBlock = blocks[++index];
  while (nextBlock) {
    let hasMatchingParents = true;
    for (let i = 0, len = block.parents.length; i < len; i++) {
      hasMatchingParents &&=
        block.parents[i] == null || nextBlock.parents[i] === block.parents[i];
      if (!hasMatchingParents) {
        break;
      }
    }
    // If there's the same number of parents in this block
    // and the next block, they're adjacent
    if (
      !hasMatchingParents ||
      nextBlock.parents.length === block.parents.length
    ) {
      break;
    }
    nextBlock = blocks[++index];
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
    blockIndex = json.text.indexOf("\uFFFC", blockIndex + 1);
  }
  positions.push(json.text.length);

  for (let i = 0, len = positions.length - 1; i < len; i++) {
    let block = blocks[i];
    if (block.type === "text") {
      annotations.push(
        new ParseAnnotation({
          start: positions[i],
          end: positions[i] + 1,
        })
      );
      continue;
    }
    let AnnotationClass = schemaForItem(block, DocumentClass);
    let position = offsetsForBlock(blocks, i, positions);
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
