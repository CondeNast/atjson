import Annotation from './annotation';
import Document from './index';

interface AttributeList {
  [key: string]: any;
}

export interface Filter {
  [key: string]: any;
}

export interface Renaming {
  [key: string]: string | Renaming;
}

export interface FlattenedRenaming {
  [key: string]: string;
}

export type Transform = (annotation: Annotation) => Annotation | null;

interface TransformsByType {
  [key: string]: Transform[];
}

export function flatten(array: any[]): any[] {
  let flattenedArray = [];
  for (let i = 0, len = array.length; i < len; i++) {
    let item = array[i];
    if (Array.isArray(item)) {
      flattenedArray.push(...flatten(item));
    } else if (item != null) {
      flattenedArray.push(item);
    }
  }
  return flattenedArray;
}

function clone(object: any) {
  return JSON.parse(JSON.stringify(object));
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
  return;
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

function matches(annotation: any, filter: Filter): boolean {
  return Object.keys(filter).every(key => {
    let value = filter[key];
    if (typeof value === 'object') {
      return matches(annotation[key], value);
    }
    return annotation[key] === value;
  });
}

export default class Query {
  filter: Filter;
  private document: Document;
  private transforms: Transform[];
  private currentAnnotations: Annotation[];

  constructor(document: Document, filter: Filter) {
    this.document = document;
    this.filter = filter;
    this.transforms = [(annotation: Annotation) => annotation];
    this.currentAnnotations = document.annotations.filter(annotation => matches(annotation, this.filter));
  }

  run(newAnnotation: Annotation): Annotation[] {
    // Release the list of currently filtered annotations
    this.currentAnnotations = [];
    if (matches(newAnnotation, this.filter)) {
      let alteredAnnotations = this.transforms.reduce((annotations: Annotation[], transform: Transform) => {
        return flatten(annotations.map(transform));
      }, [newAnnotation]);

      return alteredAnnotations;
    }
    return [newAnnotation];
  }

  set(patch: any): Query {
    let flattenedPatch = flattenPropertyPaths(patch, { keys: true });
    return this.map((annotation: Annotation) => {
      let result = clone(annotation);
      Object.keys(flattenedPatch).forEach(key => {
        set(result, key, flattenedPatch[key]);
      });
      return result;
    });
  }

  unset(...keys: string[]): Query {
    return this.map((annotation: Annotation) => {
      return without(annotation, keys);
    });
  }

  rename(renaming: Renaming): Query {
    let flattenedRenaming = flattenPropertyPaths(renaming, { keys: true, values: true });
    return this.map((annotation: Annotation) => {
      let result = without(annotation, Object.keys(flattenedRenaming));
      Object.keys(flattenedRenaming).forEach(key => {
        let value = get(annotation, key);
        set(result, flattenedRenaming[key], value);
      });
      return result;
    });
  }

  map(mapping: Renaming | Transform): Query {
    if (typeof mapping === 'object') {
      return this.rename(mapping);
    } else {
      this.transforms.push(mapping);
      this.currentAnnotations = flatten(this.currentAnnotations.map(annotation => {
        let alteredAnnotation = mapping(annotation);
        if (alteredAnnotation == null) {
          this.document.removeAnnotation(annotation);
        } else if (Array.isArray(alteredAnnotation)) {
          this.document.replaceAnnotation(annotation, ...alteredAnnotation);
        } else {
          this.document.replaceAnnotation(annotation, alteredAnnotation);
        }
        return alteredAnnotation;
      }));
      return this;
    }
  }

  remove(): Query {
    return this.map((_: Annotation) => null);
  }
}
