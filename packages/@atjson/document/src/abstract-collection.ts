import {
  Annotation,
  AnnotationJSON,
  AnnotationNamed,
  Collection,
  Document,
  NamedCollection,
  SchemaClasses,
  SchemaDefinition,
  SchemaNames,
  ParseAnnotation,
  UnknownAnnotation,
  isValidName,
  isValidType
} from "./internals";

export function sort(a: Annotation<any>, b: Annotation<any>) {
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

export class AbstractCollection<
  Schema extends SchemaDefinition,
  Filter extends Annotation<any>
> {
  document: Document<Schema>;
  schema: Schema;
  annotations: Filter[];

  constructor(document: Document<Schema>, annotations: Filter[]) {
    this.document = document;
    this.schema = document.schema;
    this.annotations = annotations;
  }

  *[Symbol.iterator](): IterableIterator<Filter> {
    for (let annotation of this.annotations) {
      yield annotation;
    }
  }

  get length() {
    return this.annotations.length;
  }

  map<T>(mapper: (annotation: Filter) => T) {
    return this.annotations.map(mapper);
  }

  forEach(callback: (annotation: Filter) => void) {
    this.annotations.forEach(callback);
  }

  reduce<T>(
    reducer: (
      accumulator: T,
      currentValue: Filter,
      currentIndex: number,
      array: Filter[]
    ) => T,
    initialValue: T
  ) {
    return this.annotations.reduce(reducer, initialValue);
  }

  sort(sortFunction = sort) {
    this.annotations = [...this.annotations].sort(sortFunction);
    return this;
  }

  where<Name extends SchemaNames<Schema>>(
    className: Name
  ): Collection<Schema, InstanceType<AnnotationNamed<Schema, Name>>>;
  where<
    Type extends
      | SchemaClasses<Schema>
      | typeof ParseAnnotation
      | typeof UnknownAnnotation
  >(type: Type): Collection<Schema, InstanceType<Type>>;
  where(
    callback: Partial<AnnotationJSON> | ((value: Filter) => unknown)
  ): Collection<Schema, Filter>;
  where<
    Type extends
      | SchemaClasses<Schema>
      | typeof ParseAnnotation
      | typeof UnknownAnnotation,
    Name extends string
  >(
    filter: ((value: Filter) => boolean) | Partial<AnnotationJSON> | Name | Type
  ) {
    if (isValidName(this.schema, filter)) {
      let Class = this.schema.annotations[filter];
      return new Collection(
        this.document,
        this.annotations.filter(a => a instanceof Class) as Array<
          InstanceType<AnnotationNamed<Schema, Name>>
        >
      );
    } else if (isValidType(this.schema, filter)) {
      /**
       * this is just inlining the logic for the common case where the filter object looks like `{ type: '-vendor-type' }` for performance reasons
       */
      if (Object.keys(filter).length === 1 && filter.type != null) {
        let annotations = [];
        for (let a of this.annotations) {
          if (
            filter.type === `-${a.vendorPrefix}-${a.type}` ||
            (a.type === "unknown" &&
              a.vendorPrefix === "atjson" &&
              a.attributes.type === filter.type)
          ) {
            annotations.push(a);
          }
        }

        return new Collection(this.document, annotations);
      } else {
        return new Collection(
          this.document,
          this.annotations.filter(a => a instanceof filter) as Array<
            InstanceType<Type>
          >
        );
      }
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

  as<LeftName extends string>(name: LeftName) {
    return new NamedCollection<Schema, LeftName, Filter>(
      this.document,
      this.annotations,
      name
    );
  }

  update(
    updater: (
      annotation: Filter
    ) => void | {
      add?: Filter[];
      remove?: Filter[];
      retain?: Filter[];
      update?: Array<[Filter, Filter]>;
    }
  ) {
    let newAnnotations: Filter[] = [];

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
