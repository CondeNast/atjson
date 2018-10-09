import Document, { Annotation } from './index';
import NamedCollection from './named-collection';

export interface Renaming {
  [key: string]: string | Renaming;
}

export interface FlattenedRenaming {
  [key: string]: string;
}

function clone(object: any) {
  return JSON.parse(JSON.stringify(object));
}

function matches(annotation: any, filter: { [key: string]: any; }): boolean {
  return Object.keys(filter).every(key => {
    let value = filter[key];
    if (typeof value === 'object') {
      return matches((annotation as any)[key], value);
    }
    return (annotation as any)[key] === value;
  });
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

export default class AnnotationCollection {
  document: Document;
  annotations: Annotation[];

  constructor(document: Document, annotations: Annotation[] = []) {
    this.document = document;
    this.annotations = annotations;
  }

  *[Symbol.iterator](): IterableIterator<Annotation> {
    for (let annotation of this.annotations) {
      yield annotation;
    }
  }

  where(filter: { [key: string]: any; } | ((annotation: Annotation) => boolean)) {
    if (filter instanceof Function) {
      return new AnnotationCollection(this.document, this.annotations.filter(filter));
    }

    let annotations = this.annotations.filter(annotation => {
      return matches(annotation, filter);
    });
    return new AnnotationCollection(this.document, annotations);
  }

  as<T extends string>(name: T) {
    return new NamedCollection<T>(this.document, this.annotations, name);
  }

  update(updater: (annotation: Annotation) => { add?: Annotation[]; remove?: Annotation[]; retain?: Annotation[]; update?: Array<[Annotation, Annotation]>; }) {
    let newAnnotations: Annotation[] = [];

    this.annotations.map(updater).map((result: {
      add?: Annotation[];
      remove?: Annotation[];
      retain?: Annotation[];
      update?: Array<[Annotation, Annotation]>;
    } = {}) => {
      let annotations: Annotation[] = [];

      if (result.add) annotations.push(...result.add);
      if (result.update) annotations.push(...result.update.map(a => a[1]));
      if (result.retain) annotations.push(...result.retain);

      return annotations;
    }).reduce((annotations, annotationList) => {
      annotations.push(...annotationList);
      return annotations;
    }, newAnnotations);

    this.annotations = newAnnotations;
    return this;
  }

  set(patch: any) {
    let flattenedPatch = flattenPropertyPaths(patch, { keys: true });
    return this.update(annotation => {
      let result = clone(annotation) as Annotation;
      Object.keys(flattenedPatch).forEach(key => {
        set(result, key, flattenedPatch[key]);
      });
      this.document.replaceAnnotation(annotation, result);
      return {
        update: [[annotation, result]]
      };
    });
  }

  unset(...keys: string[]) {
    return this.update(annotation => {
      let result = without(annotation, keys) as Annotation;
      this.document.replaceAnnotation(annotation, result);
      return {
        update: [[annotation, result]]
      };
    });
  }

  rename(renaming: Renaming) {
    let flattenedRenaming = flattenPropertyPaths(renaming, { keys: true, values: true });
    return this.update(annotation => {
      let result = without(annotation, Object.keys(flattenedRenaming)) as Annotation;
      Object.keys(flattenedRenaming).forEach(key => {
        let value = get(annotation, key);
        set(result, flattenedRenaming[key], value);
      });

      return {
        update: [[annotation, result]]
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
