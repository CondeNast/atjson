import Annotation from './annotation';
import Document from './index';

interface AttributeList {
  [key: string]: any;
}

export interface Filter {
  [key: string]: any;
}

interface Mapping {
  [key: string]: string;
}

interface TransformsByType {
  [key: string]: DeferredTransform[];
}

type Transform = (annotation: Annotation, document: Document) => Annotation;

function clone(object) {
  return JSON.parse(JSON.stringify(object));
}

function without(object: any, attributes: string[]): any {
  let copy = {};
  Object.keys(object).forEach((key: string) => {
    let activeAttributes = attributes.filter(attribute => attribute.split('.')[0] === key);
    if (activeAttributes.length === 0) {
      copy[key] = object[key];
    } else if (!activeAttributes.includes(key)) {
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

function matches(annotation: Annotation, filter: Filter) {
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
  private transforms: Transform[];
  private currentAnnotations: Annotation[];

  constructor(document: Document, filter: Filter) {
    this.document = document;
    this.filter = filter;
    this.transforms = [(annotation: Annotation) => annotation];
    this.currentAnnotations = document.annotations.filter(annotation => matches(annotation, this.filter));
  }

  run(newAnnotation: Annotation) {
    // Release the list of currently filtered annotations
    this.currentAnnotations = [];
    if (matches(newAnnotation, this.filter)) {
      let alteredAnnotation = this.transforms.reduce((annotation: Annotation, transform: Transform) => {
        return transform(annotation);
      }, newAnnotation);

      return alteredAnnotation;
    }
    return newAnnotation;
  }

  set(patch: any): Query {
    return this.map((annotation: Annotation) => {
      return Object.assign(clone(annotation), clone(patch));
    });
  }

  unset(...keys: string[]): Query {
    return this.map((annotation: Annotation) => {
      return without(annotation, keys);
    });
  }

  map(mapping: Mapping | Transform): Query {
    if (typeof mapping === 'object') {
      return this.map((annotation: Annotation) => {
        let result = without(annotation, Object.keys(mapping));
        Object.keys(mapping).forEach(key => {
          let value = get(annotation, key);
          set(result, mapping[key], value);
        });
        return result;
      });
    } else {
      this.transforms.push(mapping);
      this.currentAnnotations = this.currentAnnotations.map(annotation => {
        let alteredAnnotation = mapping(annotation);
        if (alteredAnnotation == null) {
          this.document.removeAnnotation(annotation);
        } else {
          this.document.replaceAnnotation(annotation, alteredAnnotation);
        }
        return alteredAnnotation;
      });
      return this;
    }
  }

  remove(): Query {
    return this.map(() => null);
  }
}
