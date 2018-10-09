import Annotation from './annotation';
import Document from './index';
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

export default class NamedCollection<L extends string> {
  readonly name: L;
  document: Document;
  annotations: Annotation[];

  constructor(document: Document, annotations: Annotation[] = [], name: L) {
    this.document = document;
    this.annotations = annotations;
    this.name = name;
  }

  *[Symbol.iterator](): IterableIterator<Annotation> {
    for (let annotation of this.annotations) {
      yield annotation;
    }
  }

  where(filter: { [key: string]: any; } | ((annotation: Annotation) => boolean)) {
    if (filter instanceof Function) {
      return new NamedCollection<L>(this.document, this.annotations.filter(filter), this.name);
    }

    let annotations = this.annotations.filter(annotation => {
      return matches(annotation, filter);
    });
    return new NamedCollection<L>(this.document, annotations, this.name);
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

  join<R extends string>(rightCollection: NamedCollection<R>, filter: (lhs: Annotation, rhs: Annotation) => boolean): never | Join<L, R> {
    if (rightCollection.document !== this.document) {
      // n.b. there is a case that this is OK, if the RHS's document is null,
      // then we're just joining on annotations that shouldn't have positions in
      // the document.
      throw new Error('Joining annotations from two different documents is non-sensical. Refusing to continue.');
    }

    let results = new Join<L, R>(this, []);

    this.annotations.forEach((leftAnnotation: Annotation): void => {
      let joinAnnotations = rightCollection.annotations.filter((rightAnnotation: Annotation) => {
        return filter(leftAnnotation, rightAnnotation);
      });

      if (joinAnnotations.length > 0) {
        let join: Partial<Record<L | R, Annotation[]>> = {};
        Object.defineProperty(join, this.name, { value: [leftAnnotation] });
        Object.defineProperty(join, rightCollection.name, { value: joinAnnotations });
        results.push(join as Record<L | R, Annotation[]>);
      }
    });

    return results;
  }
}
