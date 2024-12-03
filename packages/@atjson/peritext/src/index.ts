import Document, {
  Block,
  Mark,
  EdgeBehaviour,
  JSON,
  AnnotationConstructor,
  AttributesOf,
  Annotation,
  SliceAnnotation,
  TextAnnotation,
} from "@atjson/document";
import uuid from "uuid-random";

export type Peritext = {
  text: string;
  blocks: Block[];
  marks: Mark[];
};

type Range = `${"[" | "("}${number}..${number}${"]" | ")"}`;

function areParentsEqual(left: string[], right: string[]) {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function attributesWithStableIds(
  attribute: any,
  ids: Map<string, string>
): NonNullable<any> {
  if (attribute == null) {
    return null;
  } else if (Array.isArray(attribute)) {
    const copy: any[] = [];
    for (let i = 0, len = attribute.length; i < len; i++) {
      copy[i] = attributesWithStableIds(attribute[i], ids);
    }
    return copy;
  } else if (attribute instanceof Document) {
    return attribute;
  } else if (typeof attribute === "object") {
    const copy: NonNullable<any> = {};
    for (const key in attribute) {
      if (attribute[key] !== undefined) {
        copy[key] = attributesWithStableIds(attribute[key], ids);
      }
    }
    return copy;
  } else if (typeof attribute === "string" && ids.has(attribute)) {
    return ids.get(attribute);
  }
  return attribute;
}

/**
 * Returns a modified copy of `doc` where all blocks and
 *   marks have had their `id` properties re-generated in a
 *   deterministic way, to enable easy document comparisons during
 *   testing.
 *
 * Any properties on blocks or marks that exactly match a block or
 *   mark `id` property will also be updated to the corresponding
 *   id in the resulting document. Only exact matches are treated
 *   this way, substring matches are not detected or handled.
 *
 * @param doc - a peritext document
 * @returns a modified copy of `doc` with stabilized ids
 */
export function stabilizeIds(doc: Peritext) {
  let blockCounter = 0;
  let markCounter = 0;
  const ids = new Map<string, string>();
  for (const block of doc.blocks) {
    let id = (blockCounter++).toString(16);
    id = `B${"00000000".slice(id.length) + id}`;
    ids.set(block.id, id);
  }
  for (const mark of doc.marks) {
    let id = (markCounter++).toString(16);
    id = `M${"00000000".slice(id.length) + id}`;
    ids.set(mark.id, id);
  }
  for (const block of doc.blocks) {
    const id = ids.get(block.id);
    if (id) {
      block.id = id;
    }
    block.attributes = attributesWithStableIds(block.attributes, ids);
  }
  for (const mark of doc.marks) {
    const id = ids.get(mark.id);
    if (id) {
      mark.id = id;
    }
    mark.attributes = attributesWithStableIds(mark.attributes, ids);
  }

  return doc;
}

function unsafe_parseRange(range: Range) {
  const [lhs, rhs] = range.split("..");
  const leadingChar = lhs[0];
  const trailingChar = rhs[rhs.length - 1];
  const start = parseInt(lhs.slice(1), 10);
  const end = parseInt(rhs.slice(0, -1), 10);

  return {
    start,
    end,
    edgeBehaviour: {
      leading:
        leadingChar === "(" ? EdgeBehaviour.preserve : EdgeBehaviour.modify,
      trailing:
        trailingChar === ")" ? EdgeBehaviour.preserve : EdgeBehaviour.modify,
    },
  };
}

function serializeRange(
  start: number,
  end: number,
  edgeBehaviour: { leading: EdgeBehaviour; trailing: EdgeBehaviour }
): Range {
  return `${
    edgeBehaviour.leading === EdgeBehaviour.preserve ? "(" : "["
  }${start}..${end}${
    edgeBehaviour.trailing === EdgeBehaviour.preserve ? ")" : "]"
  }`;
}

function adjustMarkRange(mark: Mark, offset: number): Mark {
  const { start, end, edgeBehaviour } = unsafe_parseRange(mark.range);

  return {
    ...mark,
    range: serializeRange(start + offset, end + offset, edgeBehaviour),
  };
}

function adjustMarkEnd(mark: Mark, offset: number): Mark {
  const { start, end, edgeBehaviour } = unsafe_parseRange(mark.range);

  return {
    ...mark,
    range: serializeRange(start, end + offset, edgeBehaviour),
  };
}

/**
 * @class PeritextBuilderStep is a peritext document, suitable
 *   for use with other peritext functions, but with an additional property:
 * @property value - contains the direct result of a peritext builder function
 *   so that you can easily access the newly generated ID (for instance)
 */
class PeritextBuilderStep<ReturnT> {
  constructor(
    public text: string,
    public blocks: Block[],
    public marks: Mark[],
    private value: ReturnT
  ) {}

  static fromPeritext<ReturnT>(
    doc: Peritext,
    value: ReturnT
  ): PeritextBuilderStep<ReturnT> {
    return new PeritextBuilderStep(doc.text, doc.blocks, doc.marks, value);
  }

  /**
   * Strips the `value` field off of the data, so the resulting document
   *   can be cleanly shared;
   * @returns the equivalent peritext document, minus the `value` field
   */
  public peritext(): Peritext {
    const { blocks, marks, text } = this;
    return { blocks, marks, text };
  }

  public getValue(): ReturnT {
    return this.value;
  }

  public set<K extends keyof ReturnT>(key: K, value: ReturnT[K]) {
    this.value[key] = value;
    return this;
  }
}

/**
 * Creates a new mark and returns a document representing the `children` argument
 *   with the newly created mark spanning the whole document
 * - if `children` is a string, the string is turned into a peritext document
 *     with a text block containing that string
 * - if `children` is an array of peritext documents, those documents are
 *     concatenated as though with `concat`
 *
 * @param annotation an annotation constructor, corresponding to the desired mark
 * @param attributes the attributes to put on the created mark
 * @param children - **_may be mutated by this function_** - the contents spanned by the created mark
 * @returns a peritext document with the contents of `children`, and the newly
 *   created mark with a range from the start to the end of the created document
 */
export function mark<Type, Attrs extends Record<string, JSON>>(
  annotation: AnnotationConstructor<Type, Attrs>,
  attributes: Attrs,
  children: string | Peritext | Peritext[] = ""
): PeritextBuilderStep<Mark> {
  let doc: Peritext;

  if (typeof children === "string") {
    doc = block(TextAnnotation, {}, children);
  } else if (Array.isArray(children)) {
    doc = concat(...children);
  } else {
    doc = children;
  }

  const newMark = {
    id: uuid(),
    type: annotation.type,
    range: serializeRange(0, doc.text.length, {
      leading: EdgeBehaviour.preserve,
      trailing: EdgeBehaviour.modify,
    }),
    attributes,
  };

  doc.marks.unshift(newMark);

  return PeritextBuilderStep.fromPeritext(doc, newMark);
}

/**
 * @see {@link mark} - `slice(children[, attributes])` works like
 *   `mark(SliceAnnotation, attributes || {refs: []}, children)`
 */
export function slice(
  children: string | Peritext,
  attributes: { refs: string[]; retain?: boolean } = { refs: [] }
): PeritextBuilderStep<Mark> {
  if (
    (typeof children == "string" && children === "") ||
    (typeof children == "object" && children.text === "")
  ) {
    throw new Error(
      "Slices must have some contents; an empty slice will cause errors."
    );
  }

  return mark(SliceAnnotation, attributes, children);
}

/**
 * creates a peritext document with a new root block corresponding to the provided annotation
 *   constructor, and all the contents of the provided `children` as its descendants.
 * - __if `children` is a string__, the string is inserted as the text of the resulting document.
 * - __if `children` is an array of peritext documents__, those documents are
 *     concatenated as though with `concat`
 * - __if `children` is a function__, the new block is first created and then passed to the function.
 *   This function may modify the properties of the block. The return value of the function is
 *   then used as the value for `children`.
 *
 * @param annotation an annotation constructor, corresponding to the desired block
 * @param attributes the attributes to put on the created mark
 * @param children - **_may be mutated by this function_** - the contents to be nested inside the
 *   created block
 * @returns a peritext document with the contents of `children` nested inside the
 *   newly created block
 */
export function block<Type, Attrs extends Record<string, JSON>>(
  annotation: AnnotationConstructor<Type, Attrs>,
  attributes: Attrs,
  children:
    | string
    | Peritext
    | Peritext[]
    | ((block: Block) => string | Peritext | Peritext[]) = ""
): PeritextBuilderStep<Block> {
  const newBlock = {
    id: uuid(),
    type: annotation.type,
    parents: [],
    selfClosing: false,
    attributes,
  };

  const concreteChildren: string | Peritext | Peritext[] =
    typeof children === "function" ? children(newBlock) : children;

  let peritextChildren: Peritext | undefined;
  if (typeof concreteChildren === "string") {
    peritextChildren = { text: concreteChildren, blocks: [], marks: [] };
  } else if (Array.isArray(concreteChildren)) {
    peritextChildren = concat(...concreteChildren);
  } else {
    peritextChildren = concreteChildren;
  }

  const outDoc = new PeritextBuilderStep("\uFFFC", [newBlock], [], newBlock);
  outDoc.blocks.push(
    ...peritextChildren.blocks.map((childBlock) => ({
      ...childBlock,
      parents: [annotation.type, ...childBlock.parents],
    }))
  );

  outDoc.marks.push(
    ...peritextChildren.marks.map((mark) => adjustMarkRange(mark, 1))
  );

  outDoc.text += peritextChildren.text;

  return outDoc;
}

/**
 * concatenates the arguments end-to-end, adjusting mark ranges appropriately
 * @param docs peritext documents
 * @returns a peritext document representing the concatenation of the input documents
 */
export function concat(...docs: Peritext[]): Peritext {
  const outDoc: Peritext = {
    text: "",
    blocks: [],
    marks: [],
  };

  for (const doc of docs) {
    outDoc.blocks.push(...doc.blocks);
    outDoc.marks.push(
      ...doc.marks.map((mark) => adjustMarkRange(mark, outDoc.text.length))
    );

    outDoc.text += doc.text;
  }

  return outDoc;
}

/**
 * gets all of the blocks which are descendants of a given block, in the peritext block tree
 *  of the provided document
 *
 * @param doc the peritext document to search
 * @param parentBlockId the `id` property of the block whose descendants are being selected
 * @returns all the blocks which are nested under the target block in the peritext block tree
 */
export function getDescendants(doc: Peritext, parentBlockId: string): Block[] {
  const blockIndex = doc.blocks.findIndex(({ id }) => id === parentBlockId);
  if (blockIndex === -1) return [];

  const parentBlock = doc.blocks[blockIndex];
  /**
   * identify the children of this block so they can
   * be included in the length of the block
   */
  const children: Block[] = [];
  let nextBlock = doc.blocks[blockIndex + 1];
  while (nextBlock && nextBlock.parents.length > parentBlock.parents.length) {
    children.push(nextBlock);
    nextBlock = doc.blocks[blockIndex + children.length + 1];
  }

  return children;
}

/**
 * gets all of the blocks which are immediate children of a given block, in the peritext block tree
 *   of the provided document.
 *
 * @param doc the peritext document to search
 * @param parentBlockId the `id` property of the block whose children are being selected
 * @returns all the blocks which are nested under the target block in the peritext block tree
 */
export function getChildren(doc: Peritext, parentBlockId: string): Block[] {
  const parentBlock = doc.blocks.find(({ id }) => id === parentBlockId);
  if (!parentBlock) return [];
  const allDescendants = getDescendants(doc, parentBlockId);
  const childParents = [...parentBlock.parents, parentBlock.type];

  return allDescendants.filter((block) =>
    areParentsEqual(block.parents, childParents)
  );
}

/**
 * Inserts `insertedContent` into a shallow copy of `doc`, after a block specified by `targetBlockId`.
 *   All blocks in the inserted content will be descendants of the targeted block's parents.
 *
 * @param doc a modified shallow copy of `doc` will be returned
 * @param targetBlockId the `id` property of a block in `doc`
 * @param insertedContent a peritext document to insert into `doc`
 * @returns a shallow copy of `doc`, with `insertedContent` added after the block
 *   corresponding to `targetBlockId` and all its descendants.
 */
export function insertAfter(
  doc: Peritext,
  targetBlockId: string,
  insertedContent: Peritext
) {
  const blocksText = doc.text.split("\uFFFC").slice(1);
  const blockIndex = doc.blocks.findIndex(({ id }) => id === targetBlockId);
  const targetBlock = doc.blocks[blockIndex];
  const nChildren = getDescendants(doc, targetBlockId).length;
  const insertionIndex = blockIndex + nChildren + 1;

  const beforeText = blocksText
    .slice(0, insertionIndex)
    .map((text) => `\uFFFC${text}`)
    .join("");
  const beforeBlocks = doc.blocks.slice(0, insertionIndex);
  const beforeMarks = doc.marks
    .filter((mark) => {
      const { start } = unsafe_parseRange(mark.range);
      return start < beforeText.length;
    })
    .map((mark) => {
      const { end } = unsafe_parseRange(mark.range);
      if (end <= beforeText.length) {
        return mark;
      }

      return adjustMarkEnd(mark, insertedContent.text.length);
    });

  const insertedText = insertedContent.text;
  const insertedBlocks = insertedContent.blocks.map((block) => ({
    ...block,
    parents: [...targetBlock.parents, ...block.parents],
  }));
  const insertedMarks = insertedContent.marks.map((mark) => {
    return adjustMarkRange(mark, beforeText.length);
  });

  const afterText = blocksText
    .slice(insertionIndex)
    .map((text) => `\uFFFC${text}`)
    .join("");

  const afterBlocks = doc.blocks.slice(insertionIndex);
  const afterMarks = doc.marks
    .filter((mark) => {
      const { start } = unsafe_parseRange(mark.range);
      return start >= beforeText.length;
    })
    .map((mark) => {
      return adjustMarkRange(mark, insertedContent.text.length);
    });

  return {
    text: beforeText + insertedText + afterText,
    blocks: beforeBlocks.concat(insertedBlocks, afterBlocks),
    marks: beforeMarks.concat(insertedMarks, afterMarks),
  };
}

/**
 * Inserts `insertedContent` into a shallow copy of `doc`, before a block specified by `targetBlockId`
 *
 * @param doc a modified shallow copy of `doc` will be returned
 * @param targetBlockId the `id` property of a block in `doc`
 * @param insertedContent a peritext document to insert into `doc`
 * @returns a shallow copy of `doc`, with `insertedContent` added before the block
 *   corresponding to `targetBlockId` and all its descendants.
 */
export function insertBefore(
  doc: Peritext,
  targetBlockId: string,
  insertedContent: Peritext
) {
  const blocksText = doc.text.split("\uFFFC").slice(1);
  const blockIndex = doc.blocks.findIndex(({ id }) => id === targetBlockId);
  const targetBlock = doc.blocks[blockIndex];
  const insertionIndex = blockIndex;

  const beforeText = blocksText
    .slice(0, insertionIndex)
    .map((text) => `\uFFFC${text}`)
    .join("");
  const beforeBlocks = doc.blocks.slice(0, insertionIndex);
  const beforeMarks = doc.marks
    .filter((mark) => {
      const { start } = unsafe_parseRange(mark.range);
      return start < beforeText.length;
    })
    .map((mark) => {
      const { end } = unsafe_parseRange(mark.range);
      if (end <= beforeText.length) {
        return mark;
      }

      return adjustMarkEnd(mark, insertedContent.text.length);
    });

  const insertedText = insertedContent.text;
  const insertedBlocks = insertedContent.blocks.map((block) => ({
    ...block,
    parents: [...targetBlock.parents, ...block.parents],
  }));
  const insertedMarks = insertedContent.marks.map((mark) => {
    return adjustMarkRange(mark, beforeText.length);
  });

  const afterText = blocksText
    .slice(insertionIndex)
    .map((text) => `\uFFFC${text}`)
    .join("");

  const afterBlocks = doc.blocks.slice(insertionIndex);
  const afterMarks = doc.marks
    .filter((mark) => {
      const { start } = unsafe_parseRange(mark.range);
      return start >= beforeText.length;
    })
    .map((mark) => {
      return adjustMarkRange(mark, insertedContent.text.length);
    });

  return {
    text: beforeText + insertedText + afterText,
    blocks: beforeBlocks.concat(insertedBlocks, afterBlocks),
    marks: beforeMarks.concat(insertedMarks, afterMarks),
  };
}

/**
 * Creates a shallow copy of `doc` where the children of the block corresponding to `parentBlockId`
 *   are chunked into groups of size `groupSize`, wrapping each group in a new block whose type is
 *   provided by `wrapper` and whose attributes are provided by `wrapperAttributes`
 *
 * @param doc
 * @param parentBlockId
 * @param groupSize - must be greater than 0
 * @param wrapper
 * @param wrapperAttributes
 * @returns
 */
export function groupChildren<Type, Attrs extends Record<string, JSON>>(
  doc: Peritext,
  parentBlockId: string,
  groupSize: number,
  wrapper: AnnotationConstructor<Type, Attrs>,
  wrapperAttributes: Attrs
): Peritext {
  let outDoc = { text: doc.text, blocks: doc.blocks, marks: doc.marks };
  const parentBlock = doc.blocks.find(({ id }) => id === parentBlockId);
  if (!parentBlock) return outDoc; // maybe throw error?
  if (groupSize < 1) return outDoc; // maybe throw error?

  const descendants = getDescendants(doc, parentBlockId);
  const childParentArray = [...parentBlock.parents, parentBlock.type];

  descendants
    .filter((child) => areParentsEqual(child.parents, childParentArray))
    .forEach((childBlock, index) => {
      if (index % groupSize === 0) {
        outDoc = insertBefore(
          outDoc,
          childBlock.id,
          block(wrapper, wrapperAttributes)
        );
      }
    });

  getDescendants(doc, parentBlockId).forEach((childBlock) => {
    childBlock.parents.splice(childParentArray.length, 0, wrapper.type);
  });

  return outDoc;
}

/**
 * a typescript guard function to narrow the type of an unknown block
 *   down to a specific type Block<T>
 */
export function blockIsAnnotation<T extends Annotation>(
  block: Block<unknown>,
  annotation: AnnotationConstructor<T, AttributesOf<T>>
): block is Block<T> {
  return block.type === annotation.type;
}
