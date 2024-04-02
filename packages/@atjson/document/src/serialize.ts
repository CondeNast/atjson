import {
  AnnotationConstructor,
  BlockAnnotation,
  Document,
  EdgeBehaviour,
  ObjectAnnotation,
  ParseAnnotation,
  JSONObject,
  Annotation,
  SliceAnnotation,
  TextAnnotation,
  UnknownAnnotation,
  is,
  withStableIds,
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
 * A mark describes a range of text with inline information.
 * This could be text formatting, like bold, italics;
 * links, comments, and other information describing a range
 * of text.
 */
export type Mark<T = null> = {
  id: string;
  type: string;
  range: Range;
  attributes: T extends Annotation<infer Attributes> ? Attributes : JSONObject;
};

/**
 * A block is a non-split range of text that may
 * be a paragraph or quote, or a self closing block
 * that may be something like an image orstylistic divider.
 *
 * Blocks are indicated using a block boundary
 * character of `\uFFFC` and they are stored
 * *in order* of their occurrence in the document.
 * This means that if you choose to store blocks
 * in a database, the block ordering _must_ be kept
 * to ensure that the correct blocks are rendered
 * in the correct place.
 */
export type Block<T = null> = {
  id: string;
  type: string;
  /**
   * Range is only included if specified
   * as an option. These ranges should be
   * used for purely analytical purposes
   * and should not be used to render content
   * in any way.
   */
  range?: Range;
  parents: string[];
  selfClosing?: boolean;
  attributes: T extends Annotation<infer Attributes> ? Attributes : JSONObject;
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

export enum TokenType {
  BLOCK_START,
  BLOCK_END,
  MARK_START,
  MARK_END,
  PARSE_START,
  PARSE_END,
  MARK_COLLAPSED,
}

class Root extends BlockAnnotation {
  static vendorPrefix = "atjson";
  static type = "root";
}

export type Token = {
  type: TokenType;
  index: number;
  annotation: Annotation<any>;
  shared: { start: number };
  selfClosing: boolean;
  edgeBehaviour: { leading: EdgeBehaviour; trailing: EdgeBehaviour };
};

export type SortableToken = {
  index: number;
  type: TokenType;
  annotation: {
    id: string;
    type: string;
    start: number;
    end: number;
    rank: number;
  };
};

export function sortTokens(lhs: SortableToken, rhs: SortableToken) {
  let indexDelta = lhs.index - rhs.index;
  if (indexDelta !== 0) {
    return indexDelta;
  }

  let isLhsStart =
    lhs.type === TokenType.BLOCK_START ||
    lhs.type === TokenType.MARK_START ||
    lhs.type === TokenType.PARSE_START;
  let isLhsEnd = !isLhsStart;
  let isRhsStart =
    rhs.type === TokenType.BLOCK_START ||
    rhs.type === TokenType.MARK_START ||
    rhs.type === TokenType.PARSE_START;
  let isRhsEnd = !isRhsStart;

  // Handle start before end for a 0 length mark:
  // We're assuming that one of `a` or `b` is a start
  // token and the other is the end token. Sort the start
  // token first
  if (lhs.annotation.id === rhs.annotation.id) {
    return isLhsStart ? -1 : 1;
  }

  // Sort end tokens before start tokens
  if (isLhsStart && isRhsEnd) {
    return 1;
  } else if (isLhsEnd && isRhsStart) {
    return -1;
  }

  // In the following example, we are sorting tokens
  // where the start tokens are in the same position
  // and the end positions are different.
  //
  // We always want to create the most contiguous
  // non-overlapping ranges, so we will place the
  // parse token in this example _after_ the paragraph
  // start token.
  //
  // In the ending case, we will put the parse token
  // end token _before_ the paragraph end token.
  //
  // ```
  // <p>Hello, world</p>
  // ^ ^            ^  ^
  // |-| ParseToken |--|
  // |----Paragraph----|
  // ```
  if (isLhsStart && isRhsStart) {
    if (lhs.annotation.end < rhs.annotation.end) {
      return 1;
    } else if (lhs.annotation.end > rhs.annotation.end) {
      return -1;
    }
  } else if (isLhsEnd && isRhsEnd) {
    // Handle collapsed ranges, in this case we want
    // to put the collapsed range _after_ whatever range
    // it was adjacent to, so it can be expanded in place
    // (hopefully) correctly. For explicit and better
    // handling of this, clients should make their collapsed
    // annotations 1 length by wrapping them around a
    // parse annotation.
    //
    // ```
    // <p>Hello, world</p>
    // ^ ^            ^  ^
    // |-| ParseToken |--|
    //       LineBreak ->|
    // ```
    if (lhs.annotation.start === lhs.annotation.end) {
      return 1;
    } else if (rhs.annotation.start === rhs.annotation.end) {
      return -1;
    } else if (lhs.annotation.start < rhs.annotation.start) {
      return 1;
    } else if (lhs.annotation.start > rhs.annotation.start) {
      return -1;
    }
  }

  let multiplier = isLhsEnd ? -1 : 1;
  let rankDelta = lhs.annotation.rank - rhs.annotation.rank;
  if (rankDelta !== 0) {
    return rankDelta * multiplier;
  }
  return lhs.annotation.type > rhs.annotation.type
    ? multiplier * -1
    : lhs.annotation.type < rhs.annotation.type
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
  // And sort by id if all else fails
  return a.id < b.id ? -1 : 1;
}

export function serialize(
  doc: Document,
  options?: {
    withStableIds?: boolean;
    includeBlockRanges?: boolean;
    onUnknown?: "warn" | "throw" | "ignore";
    includeParseTokens?: boolean;
  }
): { text: string; blocks: Block[]; marks: Mark[] } {
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
  // ```
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
  // ```
  let text = "";
  let blocks: Block[] = [];
  let marks: Mark[] = [];

  let root = new Root({
    start: 0,
    end: doc.content.length,
  });
  let shared = { start: -1 };
  let tokens: Token[] = [];

  let unknown: Annotation<any>[] = [];
  for (let annotation of doc.annotations) {
    let isBlockAnnotation = annotation instanceof BlockAnnotation;
    let isObjectAnnotation = annotation instanceof ObjectAnnotation;
    let isParseToken = is(annotation, ParseAnnotation);
    let types: [TokenType, TokenType] =
      isParseToken && !options?.includeParseTokens
        ? [TokenType.PARSE_START, TokenType.PARSE_END]
        : isBlockAnnotation || isObjectAnnotation
        ? [TokenType.BLOCK_START, TokenType.BLOCK_END]
        : [TokenType.MARK_START, TokenType.MARK_END];
    let edgeBehaviour = annotation.getAnnotationConstructor().edgeBehaviour;
    let shared = { start: -1 };
    if (
      types[0] === TokenType.MARK_START &&
      types[1] === TokenType.MARK_END &&
      annotation.start === annotation.end
    ) {
      tokens.push({
        type: TokenType.MARK_COLLAPSED,
        index: annotation.start,
        annotation,
        shared,
        selfClosing: isObjectAnnotation,
        edgeBehaviour,
      });
    } else {
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
    if (annotation instanceof UnknownAnnotation) {
      unknown.push(annotation);
    }
  }
  if (
    options?.onUnknown &&
    unknown.length > 0 &&
    options.onUnknown !== "ignore"
  ) {
    let info = `Unknown annotations were found:\n${unknown
      .map(
        (annotation) =>
          `- ${annotation.attributes.type}[${annotation.start}..${annotation.end}]`
      )
      .join("\n")}`;

    if (options.onUnknown === "throw") {
      throw new Error(info);
    } else {
      // eslint-disable-next-line
      console.warn(info);
    }
  }

  tokens.sort(sortTokens);
  tokens.unshift({
    type: TokenType.BLOCK_START,
    index: root.start,
    annotation: root,
    shared,
    selfClosing: false,
    edgeBehaviour: Root.edgeBehaviour,
  });
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
  let stack: Token[] = [previousBlockBoundary];
  let textLength = 0;
  let parseTokens: Token[] = [];
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
        // Keep track of the parent block
        // so we know if there's a hole
        // we need to put a text block in.
        let parent = stack[stack.length - 1];
        let isEndGap =
          previousBlockBoundary.type === token.type &&
          token.type === TokenType.BLOCK_END &&
          previousBlockBoundary.index > token.index;
        let isGap =
          previousBlockBoundary.index > token.index &&
          previousBlockBoundary.type === TokenType.BLOCK_START &&
          token.type === TokenType.BLOCK_END &&
          token.annotation.id !== parent.annotation.id;
        let isRoot =
          previousBlockBoundary.index > token.index &&
          is(token.annotation, Root) &&
          token.type === TokenType.BLOCK_START;
        if (textLength > 0 && (isEndGap || isGap || isRoot)) {
          let start = token.index;
          let startIndex = i;

          // Adjust start position if this isn't a root
          // text boundary block being created.
          //
          // In this case, we want to set the start
          // position to the next index where a parse token
          // doesn't exist. This allows for slices to include
          // text blocks and handles an edge case where
          // sometimes slices contained text boundary markers
          // and sometimes they didn't.
          while (
            (isGap || isEndGap) &&
            (tokens[startIndex + 1].type === TokenType.PARSE_START ||
              tokens[startIndex + 1].type === TokenType.PARSE_END) &&
            tokens[startIndex + 1].annotation.start === start
          ) {
            start = tokens[startIndex + 1].annotation.start;
            startIndex++;
          }

          // Adjust end position if this isn't a root
          // text boundary block being created.
          //
          // In this case, we want to set the end
          // position to the previous index where a parse token
          // doesn't exist. This allows for slices to include
          // text blocks and handles an edge case where
          // sometimes slices contained text boundary markers
          // and sometimes they didn't.
          let end = previousBlockBoundary.index;
          let endIndex = tokens.indexOf(previousBlockBoundary);
          while (
            (isGap || isEndGap) &&
            (tokens[endIndex - 1].type === TokenType.PARSE_START ||
              tokens[endIndex - 1].type === TokenType.PARSE_END) &&
            tokens[endIndex - 1].annotation.end === end
          ) {
            end = tokens[endIndex - 1].annotation.start;
            endIndex--;
          }

          // Insert text block
          let text = new TextAnnotation({
            start,
            end,
          });
          let shared = { start: -1 };
          tokens.splice(endIndex - 1, 0, {
            type: TokenType.BLOCK_END,
            index: text.end,
            annotation: text,
            selfClosing: false,
            shared,
            edgeBehaviour: TextAnnotation.edgeBehaviour,
          });
          tokens.splice(startIndex + 1, 0, {
            type: TokenType.BLOCK_START,
            index: text.start,
            annotation: text,
            selfClosing: false,
            shared,
            edgeBehaviour: TextAnnotation.edgeBehaviour,
          });
        }
        textLength = 0;
        previousBlockBoundary = token;

        // Keep track of the block stack
        // so we know whether there's holes
        if (token.type === TokenType.BLOCK_END) {
          stack.push(token);
        } else {
          stack.splice(
            stack.findIndex((t) => t.annotation.id === token.annotation.id),
            1
          );
        }
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

  let includeBlockRanges = options?.includeBlockRanges ?? false;
  let parents: string[] = [];
  parseTokens = [];
  lastIndex = 0;
  for (let token of tokens) {
    if (parseTokens.length === 0) {
      let chunk = doc.content.slice(lastIndex, token.index);
      let reservedCharacterIndex = chunk.indexOf("\uFFFC");
      if (reservedCharacterIndex !== -1) {
        let index = lastIndex + reservedCharacterIndex;
        let start = Math.max(0, index - 25);
        let end = Math.min(index + 25, doc.content.length);

        // Provides some context when throwing an error to make it easier to
        // find where the object replacement character is in a larger document
        throw new Error(
          `Text contains reserved character +uFFFC at index ${
            lastIndex + reservedCharacterIndex
          }.\n\n${doc.content.slice(start, end)}\n${" ".repeat(index - start)}^`
        );
      }
      text += chunk;
    }
    lastIndex = token.index;

    switch (token.type) {
      case TokenType.BLOCK_START: {
        let annotation = token.annotation;
        let { type, attributes } = is(annotation, UnknownAnnotation)
          ? annotation.attributes
          : annotation;

        blocks.push({
          id: annotation.id,
          type,
          parents: [...parents],
          selfClosing: token.selfClosing,
          attributes,
        });
        parents.push(token.annotation.type);
        token.shared.start = text.length;
        text += "\uFFFC";
        break;
      }
      case TokenType.BLOCK_END: {
        parents.pop();
        if (includeBlockRanges) {
          let id = token.annotation.id;
          let block = blocks.find((block) => block.id === id);
          // This shouldn't happen, but TypeScript likes this
          if (block != null) {
            block.range = serializeRange(
              token.shared.start,
              text.length,
              token.edgeBehaviour
            );
          }
        }
        break;
      }
      case TokenType.MARK_START: {
        token.shared.start = text.length;
        break;
      }
      case TokenType.MARK_END: {
        let annotation = token.annotation;
        let { type, attributes } = is(annotation, UnknownAnnotation)
          ? annotation.attributes
          : annotation;

        marks.push({
          id: annotation.id,
          type,
          range: serializeRange(
            token.shared.start,
            text.length,
            token.edgeBehaviour
          ),
          attributes,
        });
        break;
      }
      case TokenType.MARK_COLLAPSED: {
        let annotation = token.annotation;
        let { type, attributes } = is(annotation, UnknownAnnotation)
          ? annotation.attributes
          : annotation;

        marks.push({
          id: annotation.id,
          type,
          range: serializeRange(text.length, text.length, token.edgeBehaviour),
          attributes,
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

  // Provide stable ids post-serialization for ids to
  // be truly stable when marks are colinear in a serialized
  // format, but not in atjson due to parse tokens
  if (options?.withStableIds ?? false) {
    let blockCounter = 0;
    let markCounter = 0;
    let ids = new Map<string, string>();
    for (let block of blocks) {
      let id = (blockCounter++).toString(16);
      id = `B${"00000000".slice(id.length) + id}`;
      ids.set(block.id, id);
    }
    for (let mark of marks) {
      let id = (markCounter++).toString(16);
      id = `M${"00000000".slice(id.length) + id}`;
      ids.set(mark.id, id);
    }
    for (let block of blocks) {
      let id = ids.get(block.id);
      if (id) {
        block.id = id;
      }
      block.attributes = withStableIds(block.attributes, ids);
    }
    for (let mark of marks) {
      let id = ids.get(mark.id);
      if (id) {
        mark.id = id;
      }
      mark.attributes = withStableIds(mark.attributes, ids);
    }
  }

  return {
    text,
    blocks,
    marks,
  };
}

function offsetsForBlock<A>(
  blocks: Block<A>[],
  index: number,
  positions: number[]
) {
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

function schemaForItem<A>(
  item: Mark<A> | Block<A>,
  DocumentClass: typeof Document
): AnnotationConstructor<any, any> | null {
  let schema = DocumentClass.schema;
  if (item.type === "slice") {
    return SliceAnnotation;
  }
  if (item.type === "text") {
    return TextAnnotation;
  }
  for (let AnnotationClass of schema) {
    if (AnnotationClass.type === item.type) {
      return AnnotationClass;
    }
  }
  return null;
}

export function deserialize<A>(
  json: { text: string; blocks?: Block<A>[]; marks?: Mark<A>[] },
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
            attributes: block.attributes as any,
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
            attributes: mark.attributes as any,
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
