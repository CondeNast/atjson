import {
  BlockAnnotation,
  Document,
  EdgeBehaviour,
  ObjectAnnotation,
  ParseAnnotation,
  JSON,
  compareAnnotations,
  Annotation,
  UnknownAnnotation,
  AnnotationConstructor,
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

function splice(
  text: string,
  start: number,
  deleteCount?: number | undefined,
  item?: string
) {
  let before = text.slice(0, start);
  let after = deleteCount ? text.slice(start + deleteCount) : text.slice(start);
  return before + (item ?? "") + after;
}

export function serialize(doc: Document): StorageFormat {
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
  let text = doc.content;
  let blocks: Block[] = [];
  let marks: Mark[] = [];

  let annotations = [...doc.annotations].sort(compareAnnotations);
  let blockStack: Annotation[] = [];
  let offset = 0;
  for (let annotation of annotations) {
    let peek = blockStack[blockStack.length - 1];
    while (peek != null && peek.end <= annotation.start) {
      blockStack.pop();
      peek = blockStack[blockStack.length - 1];
    }

    if (annotation instanceof BlockAnnotation) {
      text = splice(text, annotation.start + offset, 0, "\uFFFC");
      offset++;
      blocks.push({
        id: annotation.id,
        type: annotation.type,
        parents: blockStack.map((stack) => stack.type),
        attributes: annotation.attributes,
      });
      blockStack.push(annotation);
    } else if (annotation instanceof ObjectAnnotation) {
      text = splice(text, annotation.start + offset, 0, "\uFFFC");
      offset++;
      blocks.push({
        id: annotation.id,
        type: annotation.type,
        parents: blockStack.map((stack) => stack.type),
        selfClosing: true,
        attributes: annotation.attributes,
      });
    } else if (annotation instanceof ParseAnnotation) {
      let length = annotation.end - annotation.start;
      text = splice(text, annotation.start + offset, length);
      offset -= length;
      // Backtrack existing marks and fix their ranges
      for (let i = marks.length - 1; i >= 0; i--) {
        let range = parseRange(marks[i].range);
        if (annotation.end > range.start && annotation.end < range.end) {
          marks[i].range = serializeRange(
            range.start,
            annotation.start,
            range.edgeBehaviour
          );
        } else {
          break;
        }
      }
    } else {
      marks.push({
        id: annotation.id,
        type: annotation.type,
        range: serializeRange(
          annotation.start + offset,
          annotation.end + offset,
          annotation.getAnnotationConstructor().edgeBehaviour
        ),
        attributes: annotation.attributes,
      });
    }
  }

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
