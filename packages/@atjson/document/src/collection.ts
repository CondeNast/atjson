import Document, { Annotation, AnnotationJSON } from "./index";
import Join from "./join";

export function compareAnnotations(a: Annotation<any>, b: Annotation<any>) {
  let startDelta = a.start - b.start;
  let endDelta = a.end - b.end;
  if (startDelta === 0) {
    if (endDelta === 0) {
      return a.type > b.type ? 1 : a.type < b.type ? -1 : 0;
    } else {
      return endDelta;
    }
  } else {
    return startDelta;
  }
}

function matches(annotation: any, filter: { [key: string]: any }): boolean {
  return Object.keys(filter).every(function matchesTest(key) {
    let value = filter[key];
    if (typeof value === "object") {
      return matches((annotation as any)[key], value);
    }
    return (annotation as any)[key] === value;
  });
}

export class Collection {
  document: Document;
  annotations: Array<Annotation<any>>;

  constructor(document: Document, annotations: Array<Annotation<any>>) {
    this.document = document;
    this.annotations = annotations;
  }

  *[Symbol.iterator](): IterableIterator<Annotation<any>> {
    for (let annotation of this.annotations) {
      yield annotation;
    }
  }

  get length() {
    return this.annotations.length;
  }

  map<T>(mapper: (annotation: Annotation<any>) => T) {
    return this.annotations.map(mapper);
  }

  forEach(callback: (annotation: Annotation<any>) => void) {
    this.annotations.forEach(callback);
  }

  reduce<T>(
    reducer: (
      accumulator: T,
      currentValue: Annotation<any>,
      currentIndex: number,
      array: Array<Annotation<any>>
    ) => T,
    initialValue: T
  ) {
    return this.annotations.reduce(reducer, initialValue);
  }

  sort(sortFunction = compareAnnotations) {
    this.annotations = [...this.annotations].sort(sortFunction);
    return this;
  }

  where(
    filter: { [key: string]: any } | ((annotation: Annotation<any>) => boolean)
  ) {
    if (filter instanceof Function) {
      return new AnnotationCollection(
        this.document,
        this.annotations.filter(filter)
      );
    }

    /**
     * this is just inlining the logic for the common case where the filter object looks like `{ type: '-vendor-type' }` for performance reasons
     */
    if (Object.keys(filter).length === 1 && filter.type != null) {
      let annotations = [];
      for (let a of this.annotations) {
        let annotationClass = a.getAnnotationConstructor();
        let vendorPrefix = annotationClass.vendorPrefix;
        if (
          filter.type === `-${vendorPrefix}-${a.type}` ||
          (a.type === "unknown" &&
            vendorPrefix === "atjson" &&
            a.attributes.type === filter.type)
        ) {
          annotations.push(a);
        }
      }

      return new AnnotationCollection(this.document, annotations);
    }

    let annotations = this.annotations.filter(function jsonMatchesFilter(
      annotation
    ) {
      return matches(annotation.toJSON(), filter);
    });
    return new AnnotationCollection(this.document, annotations);
  }

  as<T extends string>(name: T) {
    return new NamedCollection<T>(this.document, this.annotations, name);
  }

  update(
    updater: (
      annotation: Annotation<any>
    ) => void | {
      add?: Array<Annotation<any>>;
      remove?: Array<Annotation<any>>;
      retain?: Array<Annotation<any>>;
      update?: Array<[Annotation, Annotation]>;
    }
  ) {
    let newAnnotations: Array<Annotation<any>> = [];

    for (let annotation of this.annotations) {
      let updateObject = updater(annotation);
      if (updateObject) {
        if (updateObject.add) newAnnotations.push(...updateObject.add);
        if (updateObject.update)
          newAnnotations.push(
            ...updateObject.update.map(function get1(a) {
              return a[1];
            })
          );
        if (updateObject.retain) newAnnotations.push(...updateObject.retain);
      }
    }

    this.annotations = newAnnotations;
    return this;
  }

  toJSON() {
    return this.map(function annotationToJSON(a) {
      return a.toJSON();
    });
  }
}

export interface Renaming {
  [key: string]: string | Renaming;
}

export interface FlattenedRenaming {
  [key: string]: string;
}

function flattenPropertyPaths(
  mapping: Renaming,
  options: { keys: boolean; values?: boolean },
  prefix?: string
): FlattenedRenaming {
  return Object.keys(mapping).reduce(function flattenPathsReducer(
    result: FlattenedRenaming,
    key: string
  ) {
    let value = mapping[key];
    let fullyQualifiedKey = key;
    if (prefix) {
      fullyQualifiedKey = `${prefix}.${key}`;
      if (options.values) {
        value = `${prefix}.${value}`;
      }
    }
    if (typeof value !== "object") {
      result[fullyQualifiedKey] = value;
    } else {
      Object.assign(
        result,
        flattenPropertyPaths(value, options, fullyQualifiedKey)
      );
    }
    return result;
  },
  {});
}

function without(object: any, attributes: string[]): any {
  let copy: { [key: string]: any } = {};
  for (let key in object) {
    let activeAttributes = attributes.filter(function startsWithKey(attribute) {
      return attribute.split(".")[0] === key;
    });
    if (activeAttributes.length === 0) {
      copy[key] = object[key];
    } else if (activeAttributes.indexOf(key) === -1) {
      copy[key] = without(
        object[key],
        activeAttributes.map(function removeFirstKey(attribute) {
          return attribute
            .split(".")
            .slice(1)
            .join(".");
        })
      );
    }
  }
  return copy;
}

function get(object: any, key: string): any {
  if (key === "") return object;

  let [path, ...rest] = key.split(".");
  if (object) {
    return get(object[path], rest.join("."));
  }
  return null;
}

function set(object: any, key: string, value: any) {
  if (value == null) return;

  let [path, ...rest] = key.split(".");
  if (rest.length === 0) {
    object[path] = value;
  } else {
    if (object[path] == null) {
      object[path] = {};
    }
    set(object[path], rest.join("."), value);
  }
}

export default class AnnotationCollection extends Collection {
  set(patch: any) {
    let flattenedPatch = flattenPropertyPaths(patch, { keys: true });
    let patchAnnotationUpdater = (annotation: Annotation<any>) => {
      let result = annotation.toJSON() as AnnotationJSON;
      for (let key in flattenedPatch) {
        set(result, key, flattenedPatch[key]);
      }
      let newAnnotation = this.document.replaceAnnotation(annotation, result);

      let r: { update: [Annotation<any>, Annotation<any>][] } = {
        update: [[annotation, newAnnotation[0]]]
      };

      return r;
    };

    return this.update(patchAnnotationUpdater);
  }

  unset(...keys: string[]) {
    let unsetKeysUpdater = (annotation: Annotation<any>) => {
      let result = without(annotation.toJSON(), keys) as AnnotationJSON;
      let newAnnotation = this.document.replaceAnnotation(annotation, result);

      let r: { update: [Annotation<any>, Annotation<any>][] } = {
        update: [[annotation, newAnnotation[0]]]
      };

      return r;
    };

    return this.update(unsetKeysUpdater);
  }

  rename(renaming: Renaming) {
    let flattenedRenaming = flattenPropertyPaths(renaming, {
      keys: true,
      values: true
    });

    let renameUpdater = (annotation: Annotation) => {
      let json = annotation.toJSON() as AnnotationJSON;
      let result = without(annotation.toJSON(), Object.keys(flattenedRenaming));
      for (let key in flattenedRenaming) {
        let value = get(json, key);
        set(result, flattenedRenaming[key], value);
      }
      let newAnnotation = this.document.replaceAnnotation(annotation, result);

      let r: { update: [Annotation<any>, Annotation<any>][] } = {
        update: [[annotation, newAnnotation[0]]]
      };

      return r;
    };
    return this.update(renameUpdater);
  }

  remove() {
    this.document.removeAnnotations(this.annotations);
    this.annotations = [];
  }
}

export class NamedCollection<Left extends string> extends Collection {
  readonly name: Left;

  constructor(
    document: Document,
    annotations: Array<Annotation<any>>,
    name: Left
  ) {
    super(document, annotations);
    this.name = name;
  }

  outerJoin<Right extends string>(
    rightCollection: NamedCollection<Right>,
    filter: (lhs: Annotation<any>, rhs: Annotation<any>) => boolean
  ): never | Join<Left, Right> {
    if (rightCollection.document !== this.document) {
      // n.b. there is a case that this is OK, if the RHS's document is null,
      // then we're just joining on annotations that shouldn't have positions in
      // the document.
      throw new Error(
        "Joining annotations from two different documents is non-sensical. Refusing to continue."
      );
    }

    let results = new Join<Left, Right>(this, []);

    for (let leftAnnotation of this.annotations) {
      let joinAnnotations = rightCollection.annotations.filter(
        function testJoinCandidates(rightAnnotation: Annotation<any>) {
          return filter(leftAnnotation, rightAnnotation);
        }
      );

      type JoinItem = Record<Left, Annotation<any>> &
        Record<Right, Array<Annotation<any>>>;

      let join = {
        [this.name]: leftAnnotation,
        [rightCollection.name]: joinAnnotations
      };
      results.push(join as JoinItem);
    }

    return results;
  }

  join<Right extends string>(
    rightCollection: NamedCollection<Right>,
    filter: (lhs: Annotation<any>, rhs: Annotation<any>) => boolean
  ): never | Join<Left, Right> {
    return this.outerJoin(rightCollection, filter).where(
      function testRightCollectionLength(record) {
        return record[rightCollection.name].length > 0;
      }
    );
  }
}
