import { Block } from "./block";
import { Db } from "./db";
import { Mark } from "./mark";
import { BlockSchema, MarkSchema } from "./schema";

function filter<T>(expression: Filter<T>, value: T): boolean {
  if ("$eq" in expression) {
    return expression.$eq === value;
  } else if ("$neq" in expression) {
    return expression.$neq !== value;
  } else if ("$and" in expression) {
    return expression.$and.every(function $and(expression) {
      return filter(expression, value);
    });
  } else if ("$not" in expression) {
    return !filter(expression.$not, value);
  } else if ("$nor" in expression) {
    return expression.$nor.every(function $nor(expression) {
      return !filter(expression, value);
    });
  } else if ("$or" in expression) {
    return expression.$or.some(function $or(expression) {
      return filter(expression, value);
    });
  } else if ("$gt" in expression) {
    return value > expression.$gt;
  } else if ("$gte" in expression) {
    return value >= expression.$gte;
  } else if ("$lt" in expression) {
    return value < expression.$lt;
  } else if ("$lte" in expression) {
    return value <= expression.$lte;
  } else if ("$in" in expression) {
    return expression.$in.includes(value);
  } else if ("$nin" in expression) {
    return !expression.$nin.includes(value);
  } else if ("$regex" in expression) {
    return value && typeof value === "string" && expression.$regex.test(value);
  }

  throw new Error(`Unknown expression ${expression}`);
}

type EqualFilter<T> = { $eq: T };
type NotEqualFilter<T> = { $ne: T };
type AndFilter<T> = { $and: Filter<T>[] };
type NotFilter<T> = { $not: Filter<T> };
type NorFilter<T> = { $nor: Filter<T>[] };
type OrFilter<T> = { $or: Filter<T>[] };
type GreaterThanFilter<T> = { $gt: T };
type GreaterThanOrEqualFilter<T> = { $gte: T };
type LessThanFilter<T> = { $lt: T };
type LessThanOrEqualFilter<T> = { $lte: T };
type InFilter<T> = { $in: T[] };
type NotInFilter<T> = { $nin: T[] };
type RegexFilter = { $regex: RegExp };

type Filter<T> =
  | EqualFilter<T>
  | NotEqualFilter<T>
  | AndFilter<T>
  | NotFilter<T>
  | NorFilter<T>
  | OrFilter<T>
  | GreaterThanFilter<T>
  | GreaterThanOrEqualFilter<T>
  | LessThanFilter<T>
  | LessThanOrEqualFilter<T>
  | InFilter<T>
  | NotInFilter<T>
  | RegexFilter;

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
    id?: string | Filter<string>;
    type?: string | Filter<string>;
    parents?: Array<string | typeof $any>;
    selfClosing?: boolean;
    attributes?: Record<string, unknown>;
  }) {
    let results = [];
    let id =
      query.id != null
        ? typeof query.id === "string"
          ? { $eq: query.id }
          : query.id
        : null;
    let type =
      query.type != null
        ? typeof query.type === "string"
          ? { $eq: query.type }
          : query.type
        : null;

    for (let block of this.#results) {
      if (id && !filter(id, block.id)) {
        continue;
      }
      if (type && !filter(type, block.type)) {
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

  as<Name extends string>(name: Name) {
    return new NamedBlockQuery<Blocks, Marks, Name>(
      this.#db,
      this.#results,
      name
    );
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
    type?: string | Filter<string>;
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

  as<Name extends string>(name: Name) {
    return new NamedMarkQuery<Blocks, Marks, Name>(
      this.#db,
      this.#results,
      name
    );
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
