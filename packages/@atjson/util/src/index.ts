/* eslint @typescript-eslint/no-empty-interface: 0 */
interface Dictionary<T> {
  [key: string]: T | undefined;
}

type JSON = string | number | boolean | null | JSONObject | JSONArray;
interface JSONObject extends Dictionary<JSON> {}
interface JSONArray extends Array<JSON> {}

export type Mark = {
  id: string;
  type: string;
  range: string;
  attributes: JSONObject;
};

export type InternalMark = Mark & {
  start: number;
  end: number;
};

export type Block = {
  id: string;
  type: string;
  parents: string[];
  selfClosing?: boolean;
  attributes: JSONObject;
};

/**
 * The block boundary marker character,
 * used to indicate the start of block
 * boundaries.
 */
export const BLOCK_MARKER = "\uFFFC";

/**
 * The name of the root id for the map
 * of ids -> nodes. This is used as
 * a known entry point for rendering
 * the full tree.
 */
export const ROOT = "root";

/**
 * Used for text type
 */
export const TEXT = "text";

enum TokenType {
  SLICE_START,
  SLICE_END,
}

type Token = {
  type: TokenType;
  id: string;
  index: number;
  mark: InternalMark;
  ranges: [number, number][];
};

function sortSliceTokens(a: Token, b: Token) {
  let indexDelta = a.index - b.index;
  if (indexDelta !== 0) {
    return indexDelta;
  }

  // Handle start before end for a 0 length mark:
  // We're assuming that one of `a` or `b` is a start
  // token and the other is the end token. Sort the start
  // token first
  if (a.id === b.id) {
    return a.type === TokenType.SLICE_START ? -1 : 1;
  }

  // Sort end tokens before start tokens
  if (a.type !== TokenType.SLICE_START && b.type === TokenType.SLICE_START) {
    return 1;
  } else if (
    a.type === TokenType.SLICE_START &&
    b.type !== TokenType.SLICE_START
  ) {
    return -1;
  }
  let multiplier = a.type === TokenType.SLICE_START ? -1 : 1;

  let startDelta = b.mark.start - a.mark.start;
  if (startDelta !== 0) {
    return startDelta * multiplier;
  }
  let endDelta = a.mark.end - b.mark.end;
  if (endDelta !== 0) {
    return endDelta * multiplier;
  }
  return 0;
}

/**
 * Extracts slices from a document for the special `slice`
 * type provided by atjson. This function removes slices
 * from a document and provides a lookup table of document
 * slices for other functions to use as they would like.
 *
 * Slice documents _are_ valid documents— nothing special
 * is going on with them other than the fact that they
 * were part of the document and are pulled out for
 * code that wants to refer to parts of the document by reference.
 *
 * @param value The document to extract slices from.
 * @returns A tuple, with the first item being the document
 *   remainder without slices, and the second item being
 *   a lookup table of slice id to document slices.
 */
export function extractSlices(value: {
  marks: Mark[];
  blocks: Block[];
  text: string;
}) {
  let marksWithoutSlices: InternalMark[] = [];

  // Slices may overlap, which we need to take into account.
  // Currently, the only use case that I can currently imagine
  // is a slice overlapping another slice for the case of a
  // footnote with a block inside of it that has a caption / credit
  // or some other metadata. Overlapping or colinear slices
  // don't make a _ton_ of sense, but should be handled neatly
  // enough by chunking up slices so the portions of the document
  // get collected into appropriate chunks.
  let tokens: Token[] = [];
  for (let i = 0, len = value.marks.length; i < len; i++) {
    let mark = value.marks[i];
    let match = mark.range.match(/([[|(])(\d+)\.\.(\d+)([\]|)])/);
    if (match == null) {
      throw new Error(`Malformed range ${mark.range}`);
    }
    let start = parseInt(match[2]);
    let end = parseInt(match[3]);
    if (mark.type === "slice") {
      let slice = {
        start,
        end,
        ...mark,
      };
      let ranges: [number, number][] = [[start, end]];
      tokens.push(
        {
          type: TokenType.SLICE_START,
          id: mark.id,
          index: start,
          mark: slice,
          ranges,
        },
        {
          type: TokenType.SLICE_END,
          id: slice.id,
          index: end,
          mark: slice,
          ranges,
        }
      );
    } else {
      marksWithoutSlices.push({
        start,
        end,
        ...mark,
      });
    }
  }
  tokens.sort(sortSliceTokens);

  let sliceMap = new Map<
    string,
    { text: string; marks: InternalMark[]; blocks: Block[] }
  >();

  let blockBoundaryPositions: number[] = [];
  let blockIndex = value.text.indexOf(BLOCK_MARKER);
  while (blockIndex !== -1) {
    blockBoundaryPositions.push(blockIndex);
    blockIndex = value.text.indexOf(BLOCK_MARKER, blockIndex + 1);
  }
  blockBoundaryPositions.push(value.text.length);

  // A list of text ranges to remove for the remainder
  // document. The remainder will be constructed after the
  // slices are extracted so we don't have duplicated text.
  let rangesToDelete: [number, number][] = [];

  let stack: Token[] = [];
  for (let i = 0, len = tokens.length; i < len; i++) {
    let token = tokens[i];
    switch (token.type) {
      case TokenType.SLICE_START: {
        let currentSlice = stack[stack.length - 1];
        // If there is another slice on the stack,
        // we will need to split the range
        if (currentSlice) {
          let currentSliceRanges = currentSlice.ranges;
          let [start, end] = currentSliceRanges.pop() as [number, number];
          currentSliceRanges.push([start, token.index], [token.index, end]);
        }
        stack.push(token);
        continue;
      }
      case TokenType.SLICE_END: {
        stack.pop();
        let currentSlice = stack[stack.length - 1];
        if (currentSlice && currentSlice.id !== token.id) {
          let currentSliceRanges = currentSlice.ranges;
          let [, end] = currentSliceRanges.pop() as [number, number];
          currentSliceRanges.push([token.index, end]);
        }
        continue;
      }
    }
  }

  tokens = tokens.filter((token) => token.type === TokenType.SLICE_START);

  for (let i = 0, len = tokens.length; i < len; i++) {
    let token = tokens[i];

    let text = "";
    let blocks: Block[] = [];
    let marks: InternalMark[] = [];

    for (let t = 0, tlen = token.ranges.length; t < tlen; t++) {
      let [start, end] = token.ranges[t];
      text += value.text.slice(start, end);

      let parentIndex = 0;
      for (let j = 0, jlen = blockBoundaryPositions.length; j < jlen; j++) {
        let position = blockBoundaryPositions[j];
        if (position < start) {
          // Keep searching forward
          continue;
        } else if (position + 1 <= end) {
          // Add the block to the slice blocks list
          let block = value.blocks[j];
          if (blocks.length === 0) {
            parentIndex = block.parents.length;
          }
          blocks.push({
            ...block,
            id: `${token.id}-${block.id}`,
            parents: block.parents.slice(parentIndex),
          });
        } else {
          // If the block index is after the slice, we can safely break
          // from the loop, saving some extra work.
          break;
        }
      }

      let offset = 0;
      // After collecting blocks, we'll need to do a pass
      // over the text and blocks to ensure that it's well
      // formed and there's a block parent for all text.
      if (blocks.length === 0 && t === 0) {
        offset = 1;
        text = `${BLOCK_MARKER}${text}`;
        blocks.push({
          id: `${TEXT}-${token.id}`,
          type: TEXT,
          parents: [],
          selfClosing: false,
          attributes: {},
        });
      }

      for (let j = 0, jlen = marksWithoutSlices.length; j < jlen; j++) {
        let mark = marksWithoutSlices[j];

        // For slicing purposes, we only consider marks whose
        // boundaries are within the slice to be represented.
        if (
          mark.start >= start &&
          mark.start <= end &&
          mark.end >= start &&
          mark.end <= end
        ) {
          let adjustedStart = Math.max(mark.start - start, 0) + offset;
          let adjustedEnd = Math.min(mark.end - start, end - start) + offset;
          let range = `${mark.range[0]}${adjustedStart}..${adjustedEnd}${
            mark.range[mark.range.length - 1]
          }`;
          marks.push({
            ...mark,
            id: `${token.id}-${mark.id}`,
            range,
            start: adjustedStart,
            end: adjustedEnd,
          });
        }
      }

      // After handling the slice map, we'll be handling the
      // remainder of the document that excludes slices.
      // For cases where the underlying range is retained,
      // the content will be kept.
      if (token.mark.attributes.retain) {
        // If the slice is retained, we get to skip this
        // step since we want marks to be kept intact
        continue;
      }

      let isRangeInserted = false;
      // Add the slice to the ranges to delete
      for (let j = 0, jlen = rangesToDelete.length; j < jlen; j++) {
        let rangeToDelete = rangesToDelete[j];

        if (start >= rangeToDelete[0] && start <= rangeToDelete[1]) {
          // Extend the end of the range if the start is
          // within the current range
          rangeToDelete[1] = Math.max(rangeToDelete[1], end);
          isRangeInserted = true;
        } else if (end >= rangeToDelete[0] && end <= rangeToDelete[1]) {
          // Extend the start of the range if the end is
          // within the current range
          rangeToDelete[0] = Math.min(rangeToDelete[0], start);
          isRangeInserted = true;
        }
      }
      // If the slice wasn't within a range or extended a range,
      // append it to the list of ranges to remove
      if (!isRangeInserted) {
        rangesToDelete.push([start, end]);
      }
    }

    sliceMap.set(token.id, {
      text,
      marks,
      blocks,
    });
  }

  let firstRange = rangesToDelete[0];
  let text = firstRange ? value.text.slice(0, firstRange[0]) : "";
  let lastEnd = firstRange ? firstRange[1] : 0;
  for (let i = 0, len = rangesToDelete.length; i < len - 1; i++) {
    text += value.text.slice(rangesToDelete[i][1], rangesToDelete[i + 1][0]);
    lastEnd = rangesToDelete[i + 1][1];
  }

  text = text + value.text.slice(lastEnd);

  let marks: InternalMark[] = [];
  for (let mark of marksWithoutSlices) {
    let isKept = true;
    let startOffset = 0;
    let endOffset = 0;
    for (let range of rangesToDelete) {
      // If the mark is fully inside the range,
      // it won't be represented in the remainder document
      if (mark.start >= range[0] && mark.end <= range[1]) {
        isKept = false;
        break;
      }

      // Get range offset information
      // for marks that are added

      if (mark.start >= range[0] && mark.start <= range[1]) {
        // If the start is inside of the range,
        // clamp it to the range start.
        startOffset += mark.start - range[0];
      } else if (mark.start > range[1]) {
        // If the start is after the range,
        // we can add the whole range to the offset
        startOffset += range[1] - range[0];
      }

      if (mark.end >= range[0] && mark.end <= range[1]) {
        // If the end is inside of the range,
        // clamp it to the range start.
        endOffset += mark.end - range[0];
      } else if (mark.end > range[1]) {
        // If the end is after the range,
        // we can add the whole range to the offset
        endOffset += range[1] - range[0];
      }
    }

    if (isKept) {
      let start = mark.start - startOffset;
      let end = mark.end - endOffset;
      marks.push({
        ...mark,
        start,
        end,
        range: `${mark.range[0]}${start}..${end}${
          mark.range[mark.range.length - 1]
        }`,
      });
    }
  }

  let blocks: Block[] = [];
  for (let i = 0, len = blockBoundaryPositions.length; i < len; i++) {
    let position = blockBoundaryPositions[i];
    let isKept = true;
    for (let range of rangesToDelete) {
      isKept = isKept && !(position >= range[0] && position + 1 <= range[1]);
    }
    if (isKept && value.blocks[i]) {
      blocks.push(value.blocks[i]);
    }
  }

  return [
    {
      text,
      marks,
      blocks,
    },
    sliceMap,
  ] as const;
}

/**
 * Creates a lookup table to be used to render text in a
 * heirarchical structure compatible with DOM, and many
 * markup languages.
 *
 * See documentation at atjson.condenast.io/docs/util-api for
 * more details on how to use the output.
 *
 * @param value A document to flatten out into a lookup table
 * @returns A lookup table of node ids to a list of mark / block nodes
 *   or leaf strings.
 */
export function createTree(value?: {
  marks: InternalMark[];
  blocks: Block[];
  text: string;
}) {
  let chunks = (value?.text ?? "").split(BLOCK_MARKER);
  let blocks = value?.blocks ?? [];
  let marks = value?.marks ?? [];

  let tree = new Map<string, Array<Block | InternalMark | string>>();
  tree.set(ROOT, []);

  let stack: Block[] = [];
  let blockStart = 1;
  for (let i = 0, len = blocks.length; i < len; i++) {
    let block = blocks[i];
    let chunk = chunks[i + 1];
    let text: Array<string | Block> = chunk.length ? [chunk] : [];
    let blockEnd = blockStart + chunk.length;

    while (block.parents.length < stack.length) {
      stack.pop();
    }

    let parentId = stack[stack.length - 1]?.id ?? ROOT;
    let blockId =
      block.selfClosing || block.type === TEXT ? parentId : block.id;

    let parent = tree.get(parentId) ?? [];
    tree.set(parentId, parent);
    if (block.type !== TEXT) {
      parent.push(block);
    }

    if (tree.get(blockId) == null) {
      tree.set(blockId, []);
    }

    // Consume any self-closing tokens inside this block
    let nextBlock = blocks[i + 1];
    while (
      nextBlock &&
      nextBlock.selfClosing &&
      nextBlock.parents[nextBlock.parents.length - 1] === block.type
    ) {
      text.push(nextBlock);
      i++;

      chunk = chunks[i + 1];
      blockEnd += 1 + chunk.length;
      if (chunk.length) {
        text.push(chunk);
      }
      nextBlock = blocks[i + 1];
    }

    let scopedMarks: InternalMark[] = [];
    for (let j = 0, jlen = marks.length; j < jlen; j++) {
      let mark = marks[j];
      if (
        (mark.start >= blockStart && mark.start <= blockEnd) ||
        (mark.end >= blockStart && mark.end <= blockEnd)
      ) {
        scopedMarks.push(mark);
      }
    }

    // If there's no marks, we can return the text as a single chunk
    if (scopedMarks.length === 0) {
      tree.get(blockId)?.push(...text);
    } else {
      // To chunk the text properly, we need to handle several cases:
      // 1. Overlapping marks
      // 2. Nested marks
      // 3. Marks going outside the block boundary

      // First, we'll mark indexes where mark boundaries are
      let indexes: number[] = [];
      for (let i = 0, len = scopedMarks.length; i < len; i++) {
        let { start, end } = scopedMarks[i];
        start = Math.max(blockStart, start);
        end = Math.min(blockEnd, end);
        if (indexes.indexOf(start) === -1) {
          indexes.push(start);
        }
        if (indexes.indexOf(end) === -1) {
          indexes.push(end);
        }
      }
      indexes.sort((a, b) => a - b);

      // Now with the mark boundaries, we can construct a tree
      // of items in the block
      let start = blockStart;
      let consumedTextLength = 0;

      // We'll walk through the ranges and insert nodes into
      // the correct parent
      let markStack: InternalMark[] = [];
      for (let i = 0, len = indexes.length; i < len; i++) {
        let end = indexes[i];

        if (start == end && blockEnd !== start) continue;
        // Then add marks that are starting from this position
        let startingMarks = scopedMarks
          .filter(
            (mark) =>
              Math.max(mark.start, blockStart) === start &&
              mark.end > mark.start
          )
          .sort((a, b) => b.end - a.end);
        let closingMarks = scopedMarks.filter(
          (mark) => Math.min(mark.end, blockEnd) === end
        );
        markStack.push(...startingMarks);

        let parentId: string = blockId;
        for (let i = 0, len = markStack.length; i < len; i++) {
          let mark = markStack[i];
          let id = parentId === ROOT ? mark.id : `${parentId}-${mark.id}`;

          // Check to see if the mark has already been inserted
          // into the tree. There's no cases where we'll have
          // marks that are disjoint at the same level of the
          // tree, since marks are all treated the same.
          let parent = tree.get(parentId) ?? [];
          let isInserted = false;
          for (let j = 0, jlen = parent.length; j < jlen; j++) {
            let node = parent[j];
            isInserted =
              isInserted || (typeof node !== "string" && node.id === id);
          }

          if (!isInserted) {
            tree.get(parentId)?.push({
              ...mark,
              id,
            });
          }
          parentId = id;
          if (tree.get(parentId) == null) {
            tree.set(parentId, []);
          }
        }

        let markEnd = end - blockStart;

        while (consumedTextLength < markEnd) {
          let part = text.shift();
          if (part == null) break;

          if (typeof part === "string") {
            if (part.length > markEnd - consumedTextLength) {
              tree
                .get(parentId)
                ?.push(part.slice(0, markEnd - consumedTextLength));
              text.unshift(part.slice(markEnd - consumedTextLength));
              consumedTextLength = markEnd;
            } else {
              tree.get(parentId)?.push(part);
              consumedTextLength += part.length;
            }
          } else {
            tree.get(parentId)?.push(part);
            consumedTextLength++;
          }
        }

        // Remove from the stack marks that have ended first
        for (let closingMark of closingMarks) {
          let index = markStack.indexOf(closingMark);
          // Self-closing mark
          if (index === -1) {
            tree.get(parentId)?.push(closingMark);
            tree.set(closingMark.id, []);
          } else {
            markStack.splice(index, 1);
          }
        }
        start = end;
      }

      tree.get(blockId)?.push(...text);
    }

    if (!block.selfClosing && block.type !== TEXT) {
      stack.push(block);
    }
    blockStart = blockEnd + 1;
  }

  return tree;
}
