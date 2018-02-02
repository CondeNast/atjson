import Document from '../index';

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

type Transform = (annotation: Annotation, atjson: AtJSON) => Annotation;

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

  constructor(document: Document, filter: Filter) {
    this.document = document;
    this.filter = filter;
    this.transforms = [(annotation: Annotation) => annotation];
  }

  run(newAnnotation: Annotation) {
    if (matches(newAnnotation, this.filter)) {
      let alteredAnnotation = this.transforms.reduce((annotation: Annotation, transform: Transform) => {
        return transform(annotation, document);
      }, newAnnotation);

      return alteredAnnotation;
    }
    return newAnnotation;
  }

  done() {
    let newAnnotations = this.document.annotations.map(annotation => this.run(annotation))
                                                  .filter(annotation => annotation != null);
    this.document.annotations = newAnnotations;
  }

  set(patch: any): Query {
    this.transforms.push((annotation: Annotation) => {
      return Object.assign(clone(annotation), clone(patch));
    });
    return this;
  }

  unset(...keys: string[]): Query {
    this.transforms.push((annotation: Annotation) => {
      return without(annotation, keys);
    });
    return this;
  }

  map(mapping: Mapping): Query {
    this.transforms.push((annotation: Annotation) => {
      let result = without(annotation, Object.keys(mapping));
      Object.keys(mapping).forEach(key => {
        let value = get(annotation, key);
        set(result, mapping[key], value);
      });
      return result;
    });
    return this;
  }

  then(method: Transform): Query {
    this.transforms.push(method);
    return this;
  }

  remove(): Query {
    this.transforms.push(() => {
      return null;
    });
    return this;
  }
}
