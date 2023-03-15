import { Block } from "./block";
import { Db } from "./db";
import { Mark } from "./mark";

/*
function $in<T>(value: T, matches: T[]) {
  return matches.includes(value);
}

function $match(value: string | null, regexp: RegExp) {
  return value?.match(regexp) != null;
}
*/
export const $any = Symbol("any");

export class Blocks<T extends Block<T>> implements Iterable<Block<T>> {
  #db: Db;
  #results: Block<T>[];

  constructor(db: Db) {
    this.#db = db;
    this.#results = this.#db.blocks;
  }

  where(query: {
    id?: string;
    type?: string;
    parents?: Array<string | typeof $any>;
    selfClosing?: boolean;
    attributes?: T;
  }) {
    let results = [];
    for (let block of this.#results) {
      if (query.id && block.id !== query.id) {
        continue;
      }
      if (query.type && block.type !== query.type) {
        continue;
      }

      // Reverse match parents, instead of exact matching
      // the array. The most common case we want to check
      // is nesting order, thus checking parents from the
      // end to the start makes the most sense.
      if (query.parents) {
        if (block.parents >= query.parents) {
          let match = true;
          for (let i = 0, len = query.parents.length - 1; i <= length; i++) {
            if (query.parents[len - i] === $any) continue;
            if (
              block.parents[block.parents.length - i] !== query.parents[len - i]
            ) {
              match = false;
              break;
            }
          }
          if (!match) {
            continue;
          }
        } else {
          continue;
        }
      }
      if (
        query.selfClosing != null &&
        block.selfClosing === query.selfClosing
      ) {
        continue;
      }
      if (query.attributes != null) {
        let match = true;
        for (let key in query.attributes) {
          let attribute = query.attributes[key];
          let value = block.attributes[key];
          if (attribute instanceof RegExp && typeof value === "string") {
            match = match && value && value.match(attribute) != null;
          } else {
            match = match && value === attribute;
          }
        }
        if (!match) {
          continue;
        }
      }
      results.push(block);
    }
    this.#results = results;
    return this;
  }

  *[Symbol.iterator]() {
    for (let result of this.#results) {
      yield result;
    }
  }
}

export class Marks<T extends Mark<T>> implements Iterable<Mark<T>> {
  #db: Db;
  #results: Mark<T>[];
  constructor(db: Db) {
    this.#db = db;
    this.#results = this.#db.marks;
  }

  where(query: {
    id?: string;
    type?: string;
    range?:
      | { $in: [number, number] }
      | { $nin: [number, number] }
      | { $gt: number }
      | { $lt: number };
    attributes?: T;
  }) {
    let results = [];
    for (let mark of this.#results) {
      if (query.id && mark.id !== query.id) {
        continue;
      }
      if (query.type && mark.type !== query.type) {
        continue;
      }

      if (query.attributes != null) {
        let match = true;
        for (let key in query.attributes) {
          let attribute = query.attributes[key];
          let value = mark.attributes[key];
          if (attribute instanceof RegExp && typeof value === "string") {
            match = match && value && value.match(attribute) != null;
          } else {
            match = match && value === attribute;
          }
        }
        if (!match) {
          continue;
        }
      }

      results.push(mark);
    }
    this.#results = results;
    return this;
  }

  *[Symbol.iterator]() {
    for (let result of this.#results) {
      yield result;
    }
  }
}
