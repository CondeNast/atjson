import Document from '.';
import Annotation from './annotation';

export type DeprecatedTransform = (annotation: Annotation) => Annotation | null;
export type Transform = (annotation: JoinableAnnotation) => TransformResult;

export interface TransformResult {
  add?: Annotation[];
  remove?: Annotation[];
  retain?: Annotation[];
  update?: Annotation[][];
}

function isAnnotation(test: Annotation | any): test is Annotation {
  let testAsA = test as Annotation;
  return testAsA.type !== undefined && testAsA.start !== undefined && testAsA.end !== undefined;
}

function isRenaming(mapping: Renaming | Transform | DeprecatedTransform): mapping is Renaming {
  let mappingAsRenaming = mapping as Renaming;
  return typeof mappingAsRenaming === 'object';
}

export interface Renaming {
  [key: string]: string | Renaming;
}

export interface FlattenedRenaming {
  [key: string]: string;
}

function clone(object: any) {
  return JSON.parse(JSON.stringify(object));
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

export class StrictMatch {
  [key: string]: any;
}

export type JoinableAnnotation = Annotation | AnnotationJoin;

export type FilterFunction = (annotation: JoinableAnnotation) => boolean;
export type JoinFilterFunction = (leftAnnotation: JoinableAnnotation, rightAnnotation: JoinableAnnotation) => boolean;

export class AnnotationJoin {

  // Advice sought to make this not shit.
  [key: string]: JoinableAnnotation | JoinableAnnotation[] | any;

  constructor(left: JoinableAnnotation, name: string) {
    this[name] = left;
  }

  addJoin(right: JoinableAnnotation[], name: string) {
    this[name] = right;
  }
}

function matches(annotation: object, filter: StrictMatch): boolean {
  return Object.keys(filter).every(key => {
    let value = filter[key];
    if (typeof value === 'object') {
      return matches((annotation as any)[key], value);
    }
    return (annotation as any)[key] === value;
  });
}

export default class AnnotationCollection {
  document: Document;
  annotations: JoinableAnnotation[];
  name?: string;

  constructor(document: Document, annotations: JoinableAnnotation[] = []) {
    this.document = document;
    this.annotations = annotations;
  }

  *[Symbol.iterator](): IterableIterator<JoinableAnnotation> {
    for (let annotation of this.annotations) {
      yield annotation;
    }
  }

  where(filter: StrictMatch | FilterFunction): AnnotationCollection {
    let filterFn = this.getFilterFunction(filter);
    let annotations = this.annotations.filter(filterFn);
    return new AnnotationCollection(this.document, annotations);
  }

  as(name: string) {
    this.name = name;
    return this;
  }

  applyTransformResult(result: TransformResult): JoinableAnnotation[] {
    let annotations: JoinableAnnotation[] = [];

    if (result.add) result.add.forEach(a => annotations.push(a));
    if (result.update) result.update.forEach(a => annotations.push(a[1]));
    if (result.retain) result.retain.forEach(a => annotations.push(a));

    return annotations;
  }

  transform(transformFn: Transform): AnnotationCollection {
    let newAnnotations: JoinableAnnotation[] = [];

    this.annotations.map(transformFn)
                    .map(this.applyTransformResult)
                    .forEach(result => {
                      result.forEach(a => newAnnotations.push(a));
                    });

    this.annotations = newAnnotations;
    return this;
  }

  // n.b. this is deprecated. We should add a deprecation message.
  map(mapping: Renaming | DeprecatedTransform): AnnotationCollection {

    if (isRenaming(mapping)) return this.rename(mapping);

    let newAnnotations: Annotation[] = [];

    this.annotations.forEach(annotation => {

      if (!isAnnotation(annotation)) return;

      let result = mapping(annotation);

      if (result === null) {
        this.document.removeAnnotation(annotation);
      } else if (Array.isArray(result)) {
        this.document.replaceAnnotation(annotation, ...result);
        result.forEach(a => newAnnotations.push(a));
      } else {
        this.document.replaceAnnotation(annotation, result);
        newAnnotations.push(result);
      }
    });

    this.annotations = newAnnotations;

    return this;
  }

  set(patch: any): AnnotationCollection {
    let flattenedPatch = flattenPropertyPaths(patch, { keys: true });
    return this.map((annotation: JoinableAnnotation): Annotation | null => {
      if (isAnnotation(annotation)) {
        let result = clone(annotation);
        Object.keys(flattenedPatch).forEach(key => {
          set(result, key, flattenedPatch[key]);
        });
        return result as Annotation;
      } else {
        return null;
      }
    });
  }

  unset(...keys: string[]): AnnotationCollection {
    return this.map(annotation => without(annotation, keys) as Annotation);
  }

  rename(renaming: Renaming): AnnotationCollection {
    let flattenedRenaming = flattenPropertyPaths(renaming, { keys: true, values: true });
    return this.map((annotation: JoinableAnnotation): Annotation | null => {
      if (isAnnotation(annotation)) {
        let result = without(annotation, Object.keys(flattenedRenaming));
        Object.keys(flattenedRenaming).forEach(key => {
          let value = get(annotation, key);
          set(result, flattenedRenaming[key], value);
        });
        return result as Annotation;
      } else {
        return null;
      }
    });
  }

  remove(): AnnotationCollection {
    return this.map((_: JoinableAnnotation) => null);
  }

  join(rightCollection: AnnotationCollection, filter: JoinFilterFunction): AnnotationCollection {

    if (rightCollection.document !== this.document) {
      // n.b. there is a case that this is OK, if the RHS's document is null,
      // then we're just joining on annotations that shouldn't have positions in
      // the document.
      throw new Error('Joining annotations from two different documents is non-sensical. Refusing to continue.');
    }

    // This is a ridiculous and annoying hack around TypeScript being kind of
    // stupid; putting a short-circuiting type gate here doesn't clarify the
    // type below in the loop. It's either this or a wrapping `if` statement.
    let leftName: string | undefined;
    let rightName: string;
    if (typeof rightCollection.name !== 'string') {
      throw new Error('Annotation Collections must be named in order to be joined. Use `as` to set a name.');
    } else {
      leftName = this.name;
      rightName = rightCollection.name;
    }

    let results: JoinableAnnotation[] = [];

    this.annotations.forEach((leftAnnotation: JoinableAnnotation): void => {
      let joinAnnotations = rightCollection.annotations.filter((rightAnnotation: JoinableAnnotation) => {
        return filter(leftAnnotation, rightAnnotation);
      });

      if (joinAnnotations.length > 0) {
        let result;
        if (leftAnnotation instanceof AnnotationJoin && typeof leftName !== 'string') {
          // If we're joining on an unnamed already-joined collection, just reuse it.
          result = leftAnnotation;
        } else if (typeof leftName === 'string') {
          result = new AnnotationJoin(leftAnnotation, leftName);
        } else {
          throw new Error('Annotation Collections must be named in order to be joined.');
        }
        result.addJoin(joinAnnotations, rightName);

        results.push(result);
      }
    });

    return new AnnotationCollection(this.document, results);

    /*
      <figure>
        <picture>
          <source>
          <source>
        </picture>
        <figcaption>
        </figcaption>
      </figure>

      let figure = document.where({type: '-html-figure' }).as('figure');
      let picture = document.where({type: '-html-picture' }).as('picture');
      let source = document.where({type: '-html-source' }).as('sources');
      let figCaption = document.where({type: '-html-figcaption'}).as('figcaption');

      let pictureSource = picture.join(source, (l, r) => r.inside(l)).as('pictureSource');
      let bigJoin = figure.join(figCaption, (l, r) => r.inside(l))
                          .join(pictureSource, (l, r) => r.inside(l));

      let bigJoin = figure.join(figCaption, (l, r) => r.inside(l))
                          .join(source, (l, r) => r.inside(l));

      bigJoin.transform((this: Document, { figure, picture, [caption], sources }) => {
        t.update(figure, {
          type: '-verso-responsive-photo',
          attributes: {
            '-verso-caption': caption.text,
            '-verso-photos': sources.map(() => {

            })
          }
        });
        this.removeAnnotations(...picture, caption, ...sources);
      });

      {
        figure: figure (singular),
        picture: {picture: picture, source: source[]}[]
        figCaption: figCaption[]
      }[]

      {
        figure: figure (singular),
        picture: picture[]
        source: source[]
        figCaption: figCaption[]
      }[]
    */
    /*
      Veeery naïve performance analysis
      fashion show (100+ images)
      100 x (100 x 400) x 100 = 400,000,000 (~4s)

      (N x (M x P) x O) = 100,000 (~1ms)
      N = number of figures
      M = number of pictures
      O = number of figcaptions
      P = number of sources
    */
    ////
    // [{sourceAnnotation: [ joinAnnotations]}, {sourceAnnotation: [ joinAnnotations]}]
    // [ { source: Annotation, // join: Annotation[] },  ... ] }
  }

  private getFilterFunction(filter: FilterFunction | StrictMatch): FilterFunction {
    if (typeof filter === 'object') {
      return (annotation: JoinableAnnotation): boolean => matches(annotation, filter);
    } else {
      return filter;
    }
  }

}
