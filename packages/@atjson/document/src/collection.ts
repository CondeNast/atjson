import Annotation, { SerializedAnnotation } from "./annotation";
import { ParseAnnotation, UnknownAnnotation } from "./annotations";
import Document from "./document";
import NamedCollection from "./named-collection";
import {
  AnnotationNamed,
  SchemaClasses,
  SchemaDefinition,
  ValidAnnotations,
  isValidName,
  isValidType
} from "./schema";

function matches(annotation: any, filter: { [key: string]: any }): boolean {
  return Object.keys(filter).every(key => {
    let value = filter[key];
    if (typeof value === "object") {
      return matches((annotation as any)[key], value);
    }
    return (annotation as any)[key] === value;
  });
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
  return Object.keys(mapping).reduce(
    (result: FlattenedRenaming, key: string) => {
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
    {}
  );
}

function without(object: any, attributes: string[]): any {
  let copy: { [key: string]: any } = {};
  Object.keys(object).forEach((key: string) => {
    let activeAttributes = attributes.filter(
      attribute => attribute.split(".")[0] === key
    );
    if (activeAttributes.length === 0) {
      copy[key] = object[key];
    } else if (activeAttributes.indexOf(key) === -1) {
      copy[key] = without(
        object[key],
        activeAttributes.map(attribute =>
          attribute
            .split(".")
            .slice(1)
            .join(".")
        )
      );
    }
  });
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

export default class Collection<
  Schema extends SchemaDefinition,
  Annotations extends Annotation<any>
> {
  annotations: Annotations[];
  document: Document<Schema>;
  schema: Schema;

  constructor(document: Document<Schema>, annotations: Annotations[]) {
    this.schema = document.schema;
    this.document = document;
    this.annotations = annotations;
  }

  *[Symbol.iterator](): Iterator<Annotations> {
    for (let annotation of this.annotations) {
      yield annotation;
    }
  }

  get length() {
    return this.annotations.length;
  }

  as<Name extends string>(
    name: Name
  ): NamedCollection<Name, Schema, Annotations> {
    return new NamedCollection(this.document, this.annotations, name);
  }

  where<Name extends string>(
    className: Name
  ): Collection<Schema, InstanceType<AnnotationNamed<Schema, Name>>>;
  where<
    Type extends
      | SchemaClasses<Schema>
      | typeof ParseAnnotation
      | typeof UnknownAnnotation
  >(type: Type): Collection<Schema, InstanceType<Type>>;
  where(
    callback: Partial<SerializedAnnotation> | ((value: Annotations) => unknown)
  ): Collection<Schema, Annotations>;
  where<
    Type extends
      | SchemaClasses<Schema>
      | typeof ParseAnnotation
      | typeof UnknownAnnotation,
    Name extends string
  >(
    filter:
      | ((value: Annotations) => boolean)
      | Partial<SerializedAnnotation>
      | Name
      | Type
  ) {
    if (isValidName(this.schema, filter)) {
      let Class = this.schema.annotations[filter];
      return new Collection(this.document, this.annotations.filter(
        a => a instanceof Class
      ) as Array<InstanceType<AnnotationNamed<Schema, Name>>>);
    } else if (isValidType(this.schema, filter)) {
      return new Collection(this.document, this.annotations.filter(
        a => a instanceof filter
      ) as Array<InstanceType<Type>>);
    } else if (filter instanceof Function) {
      return new Collection(this.document, this.annotations.filter(filter));
    } else if (typeof filter === "object") {
      return new Collection(
        this.document,
        this.annotations.filter(a => matches(a.toJSON(), filter))
      );
    } else {
      if (typeof filter === "string") {
        throw new Error(`"${filter}" is not a valid Annotation name.`);
      } else {
        throw new Error(`"${filter}" is not a valid Annotation type.`);
      }
    }
  }

  forEach(
    callback: (value: Annotations, index: number, array: Annotations[]) => void
  ) {
    this.annotations.forEach(callback);
  }

  map<T>(
    callback: (value: Annotations, index: number, array: Annotations[]) => T
  ) {
    return this.annotations.map(callback);
  }

  filter(
    callback: (
      value: Annotations,
      index: number,
      array: Annotations[]
    ) => unknown
  ) {
    return this.annotations.filter(callback);
  }

  reduce<Result>(
    reducer: (
      previousValue: Result,
      currentValue: Annotations,
      currentIndex: number,
      array: Annotations[]
    ) => Result,
    initialValue: Result
  ) {
    return this.annotations.reduce(reducer, initialValue);
  }

  some(
    callback: (
      value: Annotations,
      index: number,
      array: Annotations[]
    ) => unknown
  ) {
    return this.annotations.some(callback);
  }

  every(
    callback: (
      value: Annotations,
      index: number,
      array: Annotations[]
    ) => unknown
  ) {
    return this.annotations.every(callback);
  }

  toArray() {
    return this.annotations.slice();
  }

  toJSON() {
    return this.map(annotation => annotation.toJSON());
  }

  sort(compareFn?: (a: Annotations, b: Annotations) => number) {
    if (compareFn) {
      this.annotations = this.toArray().sort(compareFn);
    } else {
      this.annotations = this.toArray().sort((a, b) => {
        let startDelta = a.start - b.start;
        let endDelta = a.end - b.end;
        if (startDelta !== 0) {
          return startDelta;
        } else if (endDelta !== 0) {
          return endDelta;
        } else {
          return a.type > b.type ? 1 : a.type < b.type ? -1 : 0;
        }
      });
    }
    return this;
  }

  update(
    updater: (
      annotation: Annotations
    ) => void | {
      add?: Annotations[];
      remove?: Annotations[];
      retain?: Annotations[];
      update?: Array<[Annotations, Annotations]>;
    }
  ) {
    let newAnnotations: Annotations[] = [];

    this.annotations
      .map(updater)
      .map(result => {
        let annotations: Annotations[] = [];

        if (result) {
          if (result.add) annotations.push(...result.add);
          if (result.update) annotations.push(...result.update.map(a => a[1]));
          if (result.retain) annotations.push(...result.retain);
        }
        return annotations;
      })
      .reduce((annotations, annotationList) => {
        annotations.push(...annotationList);
        return annotations;
      }, newAnnotations);

    this.annotations = newAnnotations;
    return this;
  }

  set(patch: any) {
    let flattenedPatch = flattenPropertyPaths(patch, { keys: true });
    return this.update(annotation => {
      let result = annotation.toJSON() as SerializedAnnotation;
      Object.keys(flattenedPatch).forEach(key => {
        set(result, key, flattenedPatch[key]);
      });
      let newAnnotation = this.document.replaceAnnotation(
        annotation as ValidAnnotations<Schema>,
        result
      );
      return {
        update: [[annotation, newAnnotation[0] as Annotations]]
      };
    });
  }

  unset(...keys: string[]) {
    return this.update(annotation => {
      let result = without(annotation.toJSON(), keys) as SerializedAnnotation;
      let newAnnotation = this.document.replaceAnnotation(
        annotation as ValidAnnotations<Schema>,
        result
      );
      return {
        update: [[annotation, newAnnotation[0] as Annotations]]
      };
    });
  }

  rename(renaming: Renaming) {
    let flattenedRenaming = flattenPropertyPaths(renaming, {
      keys: true,
      values: true
    });
    return this.update(annotation => {
      let json = annotation.toJSON() as SerializedAnnotation;
      let result = without(annotation.toJSON(), Object.keys(flattenedRenaming));
      Object.keys(flattenedRenaming).forEach(key => {
        let value = get(json, key);
        set(result, flattenedRenaming[key], value);
      });
      let newAnnotation = this.document.replaceAnnotation(
        annotation as ValidAnnotations<Schema>,
        result
      );

      return {
        update: [[annotation, newAnnotation[0] as Annotations]]
      };
    });
  }

  remove() {
    return this.update(annotation => {
      this.document.removeAnnotation(annotation as ValidAnnotations<any>);
      return {
        remove: [annotation]
      };
    });
  }
}
