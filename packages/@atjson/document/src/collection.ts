import Document, { Annotation, AnnotationJSON } from './index';
import Join from './join';

function matches(annotation: any, filter: { [key: string]: any; }): boolean {
  return Object.keys(filter).every(key => {
    let value = filter[key];
    if (typeof value === 'object') {
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

  reduce<T>(reducer: (accumulator: T, currentValue: Annotation<any>, currentIndex: number, array: Array<Annotation<any>>) => T, initialValue: T) {
    return this.annotations.reduce(reducer, initialValue);
  }

  sort(sortFunction?: (a: Annotation<any>, b: Annotation<any>) => number) {
    if (sortFunction) {
      this.annotations = this.annotations.sort(sortFunction);
    } else {
      this.annotations = this.annotations.sort((a, b) => {
        if (a.start - b.start === 0) {
          return a.end - b.end;
        } else {
          return a.start - b.start;
        }
      });
    }
    return this;
  }

  where(filter: { [key: string]: any; } | ((annotation: Annotation<any>) => boolean)) {
    if (filter instanceof Function) {
      return new AnnotationCollection(this.document, this.annotations.filter(filter));
    }

    let annotations = this.annotations.filter(annotation => {
      return matches(annotation.toJSON(), filter);
    });
    return new AnnotationCollection(this.document, annotations);
  }

  as<T extends string>(name: T) {
    return new NamedCollection<T>(this.document, this.annotations, name);
  }

  update(updater: (annotation: Annotation<any>) => void | { add?: Array<Annotation<any>>; remove?: Array<Annotation<any>>; retain?: Array<Annotation<any>>; update?: Array<[Annotation, Annotation]>; }) {
    let newAnnotations: Array<Annotation<any>> = [];

    this.annotations.map(updater).map(result => {
      let annotations: Array<Annotation<any>> = [];

      if (result) {
        if (result.add) annotations.push(...result.add);
        if (result.update) annotations.push(...result.update.map(a => a[1]));
        if (result.retain) annotations.push(...result.retain);
      }
      return annotations;
    }).reduce((annotations, annotationList) => {
      annotations.push(...annotationList);
      return annotations;
    }, newAnnotations);

    this.annotations = newAnnotations;
    return this;
  }

  toJSON() {
    return this.map(a => a.toJSON());
  }
}

export interface Renaming {
  [key: string]: string | Renaming;
}

export interface FlattenedRenaming {
  [key: string]: string;
}

function flattenPropertyPaths(mapping: Renaming, options: { keys: boolean, values?: boolean }, prefix?: string): FlattenedRenaming {
  return Object.keys(mapping).reduce((result: Renaming, key: string) => {
    let value = mapping[key];
    let fullyQualifiedKey = key;
    if (prefix) {
      fullyQualifiedKey = `${prefix}.${key}`;
      if (options.values) {
        value = `${prefix}.${value}`;
      }
    }
    if (typeof value !== 'object') {
      result[fullyQualifiedKey] = value;
    } else {
      Object.assign(result, flattenPropertyPaths(value, options, fullyQualifiedKey));
    }
    return result;
  }, {});
}

function without(object: any, attributes: string[]): any {
  let copy: { [key: string]: any } = {};
  Object.keys(object).forEach((key: string) => {
    let activeAttributes = attributes.filter(attribute => attribute.split('.')[0] === key);
    if (activeAttributes.length === 0) {
      copy[key] = object[key];
    } else if (activeAttributes.indexOf(key) === -1) {
      copy[key] = without(object[key], activeAttributes.map(attribute => attribute.split('.').slice(1).join('.')));
    }
  });
  return copy;
}

function get(object: any, key: string): any {
  if (key === '') return object;

  let [path, ...rest] = key.split('.');
  if (object) {
    return get(object[path], rest.join('.'));
  }
  return null;
}

function set(object: any, key: string, value: any) {
  if (value == null) return;

  let [path, ...rest] = key.split('.');
  if (rest.length === 0) {
    object[path] = value;
  } else {
    if (object[path] == null) {
      object[path] = {};
    }
    set(object[path], rest.join('.'), value);
  }
}

export default class AnnotationCollection extends Collection {

  set(patch: any) {
    let flattenedPatch = flattenPropertyPaths(patch, { keys: true });
    return this.update(annotation => {
      let result = annotation.toJSON() as AnnotationJSON;
      Object.keys(flattenedPatch).forEach(key => {
        set(result, key, flattenedPatch[key]);
      });
      let newAnnotation = this.document.replaceAnnotation(annotation, result);
      return {
        update: [[annotation, newAnnotation[0]]]
      };
    });
  }

  unset(...keys: string[]) {
    return this.update(annotation => {
      let result = without(annotation.toJSON(), keys) as AnnotationJSON;
      let newAnnotation = this.document.replaceAnnotation(annotation, result);
      return {
        update: [[annotation, newAnnotation[0]]]
      };
    });
  }

  rename(renaming: Renaming) {
    let flattenedRenaming = flattenPropertyPaths(renaming, { keys: true, values: true });
    return this.update(annotation => {
      let json = annotation.toJSON() as AnnotationJSON;
      let result = without(annotation.toJSON(), Object.keys(flattenedRenaming));
      Object.keys(flattenedRenaming).forEach(key => {
        let value = get(json, key);
        set(result, flattenedRenaming[key], value);
      });
      let newAnnotation = this.document.replaceAnnotation(annotation, result);

      return {
        update: [[annotation, newAnnotation[0]]]
      };
    });
  }

  remove() {
    return this.update(annotation => {
      this.document.removeAnnotation(annotation);
      return {
        remove: [annotation]
      };
    });
  }
}

export class NamedCollection<Left extends string> extends Collection {
  readonly name: Left;

  constructor(document: Document, annotations: Array<Annotation<any>>, name: Left) {
    super(document, annotations);
    this.name = name;
  }

  outerJoin<Right extends string>(rightCollection: NamedCollection<Right>, filter: (lhs: Annotation<any>, rhs: Annotation<any>) => boolean): never | Join<Left, Right> {
    if (rightCollection.document !== this.document) {
      // n.b. there is a case that this is OK, if the RHS's document is null,
      // then we're just joining on annotations that shouldn't have positions in
      // the document.
      throw new Error('Joining annotations from two different documents is non-sensical. Refusing to continue.');
    }

    let results = new Join<Left, Right>(this, []);

    this.forEach((leftAnnotation: Annotation<any>): void => {
      let joinAnnotations = rightCollection.annotations.filter((rightAnnotation: Annotation<any>) => {
        return filter(leftAnnotation, rightAnnotation);
      });

      type JoinItem = Record<Left, Annotation<any>> & Record<Right, Array<Annotation<any>>>;

      let join = {
        [this.name]: leftAnnotation,
        [rightCollection.name]: joinAnnotations
      };
      results.push(join as JoinItem);
    });

    return results;
  }

  join<Right extends string>(rightCollection: NamedCollection<Right>, filter: (lhs: Annotation<any>, rhs: Annotation<any>) => boolean): never | Join<Left, Right> {
    return this.outerJoin(rightCollection, filter).where(record => record[rightCollection.name].length > 0 );
  }
}
