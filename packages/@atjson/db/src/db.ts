import { Block } from "./block";
import { Mark } from "./mark";
import { Blocks, Marks } from "./query";
import uuid from "uuid-random";
import { BlockSchema, MarkSchema } from "./schema";

export class Db {
  text: string = "";

  /**
   * Blocks are in an ordered list.
   * Each block refers to a single +uFFFC
   * character in the text, which is an object
   * replacement character.
   */
  blocks: Block<any>[] = [];

  marks: Mark<any>[] = [];

  schema: {
    blocks: Record<string, BlockSchema>;
    marks: Record<string, MarkSchema>;
  };

  constructor(schema: {
    blocks: Record<string, BlockSchema>;
    marks: Record<string, MarkSchema>;
  }) {
    this.schema = schema;
  }

  /**
   * Bookkeeping so we can quickly find
   * the object replacement character, and
   * thus the range that block is over.
   *
   * These indexes are byte offsets, not
   * unicode grapheme cluster offsets.
   * @private
   */
  #blockIndexes: number[] = [];

  insertText(index: number, text: string) {
    if (text.includes("\uFFFC")) {
      throw new Error("Text must not contain the reserved character +uFFFC");
    }

    let delta = text.length;
    // Adjust block indexes (no need to adjust blocks)
    for (let i = this.#blockIndexes.length; i > 0; i--) {
      if (this.#blockIndexes[i] >= index) {
        this.#blockIndexes[i] += delta;
      } else {
        break;
      }
    }
    this.text = this.text.slice(0, index) + text + this.text.slice(index);
  }

  deleteText(start: number, end: number) {
    let blockIndexesToRemove: number[] = [];
    for (let i = this.#blockIndexes.length; i > 0; i--) {
      let index = this.#blockIndexes[i];
      if (index >= end) {
        this.#blockIndexes[i] -= end - start;
      } else if (index >= start) {
        blockIndexesToRemove.push(i);
      } else {
        break;
      }
    }
    if (blockIndexesToRemove.length) {
      let startIndex = blockIndexesToRemove[0];
      let blocksToRemove = blockIndexesToRemove.length;
      this.#blockIndexes.splice(startIndex, blocksToRemove);
      this.blocks.splice(startIndex, blocksToRemove);
    }
    this.text = this.text.slice(0, start) + this.text.slice(end);
  }

  insertBlock<T extends Record<string, unknown>>(
    index: number,
    block: Omit<Omit<Block<T>, "id">, "selfClosing"> & {
      id?: string;
      selfClosing?: boolean;
    }
  ) {
    // Automatically add an id if not present
    if (block.id == null) {
      block.id = uuid();
    }
    // Automatically set selfClosing to false
    if (block.selfClosing == null) {
      block.selfClosing = false;
    }

    let blockPosition = 0;
    if (index === this.text.length) {
      blockPosition = this.#blockIndexes.length;
    } else if (index > 0) {
      for (let i = 0, len = this.#blockIndexes.length; i < len; i++) {
        if (this.#blockIndexes[i] > index) {
          break;
        } else {
          blockPosition = i;
        }
      }
    }
    this.blocks.splice(blockPosition, 0, block as Block<T>);
    this.#blockIndexes.splice(blockPosition, 0, index);
    this.text = this.text.slice(0, index) + "\uFFFC" + this.text.slice(index);
    return block;
  }

  deleteBlock<T extends Record<string, unknown>>(block: Block<T>) {
    let offset = this.blocks.indexOf(block);
    this.blocks.splice(offset, 1);

    let index = this.#blockIndexes[offset];
    this.#blockIndexes.splice(offset, 1);
    this.text = this.text.slice(0, index) + this.text.slice(index + 1);
    return block;
  }

  replaceBlock<
    R extends Record<string, unknown>,
    L extends Record<string, unknown>
  >(oldBlock: Block<R>, newBlock: Block<L>) {
    // Automatically add an id if not present
    if (newBlock.id == null) {
      newBlock.id = uuid();
    }
    // Automatically set selfClosing to false
    if (newBlock.selfClosing == null) {
      newBlock.selfClosing = false;
    }

    let offset = this.blocks.indexOf(oldBlock);
    this.blocks.splice(offset, 1, newBlock);
    return newBlock;
  }

  select<B extends Block<B>>(_: { from: "blocks" }): Blocks<B>;
  select<M extends Mark<M>>(_: { from: "marks" }): Marks<M>;
  select<B extends Block<B>, M extends Mark<M>>(_: {
    from: "blocks" | "marks";
  }): Blocks<B> | Marks<M> {
    if (_.from === "blocks") {
      return new Blocks(this);
    }

    if (_.from === "marks") {
      return new Marks(this);
    }
    throw new Error(`No table for ${_.from} is available for querying`);
  }

  match(
    regex: RegExp,
    start?: number,
    end?: number
  ): Array<{ start: number; end: number; matches: string[] }> {
    let content = this.text.slice(start, end);
    let offset = start || 0;
    let matches = [];

    let match;
    do {
      match = regex.exec(content);
      if (match) {
        matches.push({
          start: offset + match.index,
          end: offset + match.index + match[0].length,
          matches: match.slice(),
        });
      }
    } while (regex.global && match);

    return matches;
  }
}

let db = new Db({
  blocks: {
    List: {
      type: "list",
      comment: "",
      defaultSelfClosing: false,
      attributes: [
        {
          key: "type",
          comment: "",
          type: { $oneOf: ["numbered", "bulleted"] },
        },
      ],
    },
    ListItem: {
      type: "list-item",
      comment: "",
      defaultSelfClosing: false,
      attributes: [],
    },
  },
  marks: {},
});

db.insertBlock(0, {
  type: "list",
  parents: [],
  attributes: {
    type: "bulleted",
  },
});
db.insertBlock(1, {
  type: "list-item",
  parents: ["list"],
  attributes: {},
});
db.insertText(2, "one fish");
db.insertBlock(10, {
  type: "list-item",
  parents: ["list"],
  attributes: {},
});
db.insertText(11, "two fish");
db.insertBlock(19, {
  type: "list-item",
  parents: ["list"],
  attributes: {},
});
db.insertText(20, "red fish");
db.insertBlock(28, {
  type: "list-item",
  parents: ["list"],
  attributes: {},
});
db.insertText(29, "blue fish");

console.log(db);
console.log(
  ...db
    .select({
      from: "blocks",
    })
    .where({
      type: "list-item",
    })
);
