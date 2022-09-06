import {
  BlockAnnotation,
  Document,
  EdgeBehaviour,
  ObjectAnnotation,
  ParseAnnotation,
  JSON,
  compareAnnotations,
  Annotation,
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
  parent?: string;
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
  let text: string[] = [...doc.content];
  let blocks: Block[] = [];
  let marks: Mark[] = [];

  let annotations = [...doc.annotations].sort(compareAnnotations);
  let blockStack: Annotation[] = [];
  let offset: number = 0;
  for (let annotation of annotations) {
    let peek = blockStack[blockStack.length - 1];
    while (peek != null && peek.end <= annotation.start) {
      blockStack.pop();
      peek = blockStack[blockStack.length - 1];
    }

    if (annotation instanceof BlockAnnotation) {
      text.splice(annotation.start + offset, 0, "\uFFFC");
      offset++;
      blocks.push({
        id: annotation.id,
        type: annotation.type,
        parent: blockStack[blockStack.length - 1]?.id,
        attributes: annotation.attributes,
      });
      blockStack.push(annotation);
    } else if (annotation instanceof ObjectAnnotation) {
      text.splice(annotation.start + offset, 0, "\uFFFC");
      offset++;
      blocks.push({
        id: annotation.id,
        type: annotation.type,
        parent: blockStack[blockStack.length - 1]?.id,
        attributes: annotation.attributes,
      });
    } else if (annotation instanceof ParseAnnotation) {
      text = text.splice(
        annotation.start + offset,
        annotation.end - annotation.start
      );
      offset += annotation.end - annotation.start;
    } else {
      let { leading, trailing } =
        annotation.getAnnotationConstructor().edgeBehaviour;

      marks.push({
        id: annotation.id,
        type: annotation.type,
        range: `${leading === EdgeBehaviour.preserve ? "(" : "["}${
          annotation.start + offset
        }..${annotation.end + offset}${
          trailing === EdgeBehaviour.preserve ? ")" : "]"
        }`,
        attributes: annotation.attributes,
      });
    }
  }

  return {
    text: text.join(""),
    blocks,
    marks,
  };
}

export function deserialize<T>(json: StorageFormat, DocumentClass: Document) {
  let doc = new DocumentClass({
    content: "",
    annotations: [],
  });
}
