import { Block } from "./block";
import { Db } from "./db";
import { Mark } from "./mark";
import { BlockSchema, MarkSchema } from "./schema";

/*
function $in<T>(value: T, matches: T[]) {
  return matches.includes(value);
}

function $match(value: string | null, regexp: RegExp) {
  return value?.match(regexp) != null;
}
*/
export const $any = Symbol("any");

export class BlockQuery<Blocks extends BlockSchema, Marks extends MarkSchema>
  implements Iterable<Block<Blocks>>
{
  #db: Db<Blocks, Marks>;
  #results: Block<Blocks>[];

  constructor(db: Db<Blocks, Marks>, results: Block<Blocks>[]) {
    this.#db = db;
    this.#results = results;
  }

  where(query: {
    id?: string;
    type?: string | string[];
    parents?: Array<string | typeof $any>;
    selfClosing?: boolean;
    attributes?: Record<string, unknown>;
  }) {
    let results = [];
    let ids: Record<string, true | undefined> = {};
    if (query.id != null) {
      if (Array.isArray(query.id)) {
        for (let id of query.id) {
          ids[id] = true;
        }
      } else {
        ids[query.id] = true;
      }
    }

    let types: Record<string, true | undefined> = {};
    if (query.type != null) {
      if (Array.isArray(query.type)) {
        for (let type of query.type) {
          types[type] = true;
        }
      } else {
        types[query.type] = true;
      }
    }

    for (let block of this.#results) {
      if (query.id && ids[block.id] == null) {
        continue;
      }
      if (query.type && types[block.type] == null) {
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

  as(name: string) {
    return new NamedBlockQuery<Blocks, Marks>(this.#db, this.#results, name);
  }

  *[Symbol.iterator]() {
    for (let result of this.#results) {
      yield result;
    }
  }
}

export class NamedBlockQuery<
  Blocks extends BlockSchema,
  Marks extends MarkSchema,
  Name extends string
> extends BlockQuery<Blocks, Marks> {
  name: Name;

  constructor(db: Db<Blocks, Marks>, results: Block<Blocks>[], name: Name) {
    super(db, results);
    this.name = name;
  }
}

export class MarkQuery<Blocks extends BlockSchema, Marks extends MarkSchema>
  implements Iterable<Mark<Marks>>
{
  #db: Db<Blocks, Marks>;

  #results: Mark<Marks>[];
  constructor(db: Db<Blocks, Marks>, results: Mark<Marks>[]) {
    this.#db = db;
    this.#results = results;
  }

  where<T extends string>(query: {
    id?: string | string[];
    type?: T | T[];
    range?:
      | { $in: [number, number] }
      | { $nin: [number, number] }
      | { $gt: number }
      | { $lt: number };
    attributes?: Record<string, unknown>;
  }) {
    let results = [];
    let ids: Record<string, true | undefined> = {};
    if (query.id != null) {
      if (Array.isArray(query.id)) {
        for (let id of query.id) {
          ids[id] = true;
        }
      } else {
        ids[query.id] = true;
      }
    }

    let types: Record<string, true | undefined> = {};
    if (query.type != null) {
      if (Array.isArray(query.type)) {
        for (let type of query.type) {
          types[type] = true;
        }
      } else {
        types[query.type] = true;
      }
    }

    for (let mark of this.#results) {
      if (query.id && ids[mark.id] == null) {
        continue;
      }

      if (query.type && types[mark.type] == null) {
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

  as(name: string) {
    return new NamedMarkQuery<Blocks, Marks>(this.#db, this.#results, name);
  }

  *[Symbol.iterator]() {
    for (let result of this.#results) {
      yield result;
    }
  }
}

export class NamedMarkQuery<
  Blocks extends BlockSchema,
  Marks extends MarkSchema,
  Left extends string
> extends MarkQuery<Blocks, Marks> {
  name: Left;

  constructor(db: Db<Blocks, Marks>, results: Mark<Marks>[], name: Left) {
    super(db, results);
    this.name = name;
  }

  outerJoin<Right extends string>(
    rightCollection: NamedMarkQuery<Blocks, Marks, Right>,
    filter: (lhs: Mark<Marks>, rhs: Mark<Marks>) => boolean
  ): never | Join<Left, Right>;
  outerJoin<Right extends string>(
    rightCollection: NamedBlockQuery<Blocks, Marks, Right>,
    filter: (lhs: Mark<Marks>, rhs: Block<Blocks>) => boolean
  ): never | Join<Left, Right>;
  outerJoin<Right extends string>(
    rightCollection:
      | NamedBlockQuery<Blocks, Marks, Right>
      | NamedMarkQuery<Blocks, Marks, Right>,
    filter:
      | ((lhs: Mark<Marks>, rhs: Mark<Marks>) => boolean)
      | ((lhs: Mark<Marks>, rhs: Block<Blocks>) => boolean)
  ): never | Join<Left, Right> {
    let results = new Join<Left, Right>(this, []);

    for (let mark of this) {
      let joinItems = rightCollection.annotations.filter(
        function testJoinCandidates(rightAnnotation: Annotation<any>) {
          return filter(leftAnnotation, rightAnnotation);
        }
      );

      type JoinItem = Record<Left, Mark<Marks>> &
        Record<Right, Array<Mark<Marks>>>;

      let join = {
        [this.name]: mark,
        [rightCollection.name]: joinItems,
      };
      results.push(join as JoinItem);
    }

    return results;
  }

  join<Right extends string>(
    rightCollection: NamedMarkQuery<Blocks, Marks, Right>,
    filter: (lhs: Mark<Marks>, rhs: Mark<Marks>) => boolean
  ): never | Join<Left, Right>;
  join<Right extends string>(
    rightCollection: NamedBlockQuery<Blocks, Marks, Right>,
    filter: (lhs: Mark<Marks>, rhs: Block<Blocks>) => boolean
  ): never | Join<Left, Right>;
  join<Right extends string>(
    rightCollection:
      | NamedBlockQuery<Blocks, Marks, Right>
      | NamedMarkQuery<Blocks, Marks, Right>,
    filter:
      | ((lhs: Mark<Marks>, rhs: Mark<Marks>) => boolean)
      | ((lhs: Mark<Marks>, rhs: Block<Blocks>) => boolean)
  ): never | Join<Left, Right> {
    return this.outerJoin(rightCollection, filter).where({
      [rightCollection.name]: {
        attributes: {
          $size: { $gt: 0 },
        },
      },
    });
  }
}

export class Join<Left extends string, Right extends string> {}
