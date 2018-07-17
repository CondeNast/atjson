import Annotation, { AnnotationConstructor, AnyAnnotation } from './annotation';
import { Block, Inline, Object, Parse, Unknown } from './annotations';
import { Attributes } from './attributes';
import Change, { AdjacentBoundaryBehaviour, Deletion, Insertion } from './change';
import Query, { Filter, flatten } from './query';

export interface AnnotationJSON {
  type: string;
  start: number;
  end: number;
  attributes: Attributes;
}

export {
  AdjacentBoundaryBehaviour,
  Annotation,
  AnnotationConstructor,
  AnyAnnotation,
  Attributes,
  Block as BlockAnnotation,
  Change,
  Deletion,
  Inline as InlineAnnotation,
  Insertion,
  Object as ObjectAnnotation,
  Parse as ParseAnnotation,
  Unknown as UnknownAnnotation
};

export default class AtJSON {
  static contentType: string;
  static schema: AnyAnnotation[] = [];

  content: string;
  readonly contentType: string;
  annotations: Annotation[];

  protected queries: Query[];

  constructor(options: { content: string, annotations: AnnotationJSON[] }) {
    let DocumentClass = this.constructor as typeof AtJSON;
    this.content = options.content;
    this.contentType = DocumentClass.contentType;
    this.annotations = options.annotations.map(json => this.createAnnotation(json));
    this.queries = [];
  }

  /**
   * Annotations must be explicitly allowed unless they
   * are added to the annotations array directly- this is
   * acceptable, but side-affects created by queries will
   * not be called.
   */
  addAnnotations(...annotations: AnnotationJSON[]): void {
    annotations.forEach(newAnnotation => {
      let finalizedAnnotations: AnnotationJSON[] = this.queries.reduce((newAnnotations: AnnotationJSON[], query) => {
        return flatten(newAnnotations.map(annotation => query.run(annotation)));
      }, [newAnnotation]);
      if (finalizedAnnotations) {
        this.annotations.push(...finalizedAnnotations.map(json => this.createAnnotation(json)));
      }
    });
  }

  /**
   * Add imperitive queries here. These are used to dynamically
   * change annotations before they get inserted into the document,
   * making the process of reconciliation easier.
   *
   * A simple example of this is transforming a document parsed from
   * an HTML document into a common format:
   *
   * html.where({ type: 'h1' }).set({ type: 'heading', attributes: { level: 1 }});
   *
   * When the attribute for `h1` is added to the document, it will
   * be swapped out for a `heading` with a level of 1.
   *
   * Other options available are renaming variables:
   *
   * html.where({ type: 'img' }).set({ 'attributes.src': 'attributes.url' });
   */
  where(filter: Filter): Query {
    let query = new Query(this, filter);
    this.queries.push(query);
    return query;
  }

  removeAnnotation(annotation: Annotation): Annotation | void {
    let index = this.annotations.indexOf(annotation);
    if (index > -1) {
      return this.annotations.splice(index, 1)[0];
    }
  }

  replaceAnnotation(annotation: Annotation, ...newAnnotations: AnnotationJSON[]): Annotation[] {
    let index = this.annotations.indexOf(annotation);
    if (index > -1) {
      let annotations = newAnnotations.map(json => this.createAnnotation(json));
      this.annotations.splice(index, 1, ...annotations);
      return annotations;
    }
    return [];
  }

  insertText(start: number, text: string, behaviour: AdjacentBoundaryBehaviour = AdjacentBoundaryBehaviour.default) {
    if (start < 0 || start > this.content.length) throw new Error('Invalid position.');

    let insertion = new Insertion(start, text, behaviour);
    try {
      for (let i = this.annotations.length - 1; i >= 0; i--) {
        let annotation = this.annotations[i];
        annotation.handleChange(insertion);
      }

      this.content = this.content.slice(0, start) + text + this.content.slice(start);
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.error('Failed to insert text', e);
    }
  }

  deleteText(start: number, end: number, behaviour: AdjacentBoundaryBehaviour = AdjacentBoundaryBehaviour.default) {
    let deletion = new Deletion(start, end, behaviour);
    try {
      for (let i = this.annotations.length - 1; i >= 0; i--) {
        let annotation = this.annotations[i];
        annotation.handleChange(deletion);
      }
      this.content = this.content.slice(0, start) + this.content.slice(end);
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.error('Failed to delete text', e);
    }
  }

  /**
   * Slices return part of a document from the parent
   * document. All queries are inherited from the parent
   * document.
   */
  slice(start: number, end: number): AtJSON {
    let Document: any = this.constructor;
    let doc = new Document({
      content: this.content,
      annotations: this.annotations.map(a => a.toJSON())
    });
    doc.queries = this.queries.slice();
    doc.deleteText(0, start);
    doc.deleteText(end, doc.content.length);

    return doc;
  }

  toJSON() {
    let DocumentClass = this.constructor as typeof AtJSON;
    let schema = DocumentClass.schema;

    return {
      content: this.content,
      contentType: this.contentType,
      annotations: this.annotations.map(a => a.toJSON()),
      schema: schema.map(AnnotationClass => `-${AnnotationClass.vendorPrefix}-${AnnotationClass.type}`)
    };
  }

  private createAnnotation(json: AnnotationJSON): Annotation {
    let DocumentClass = this.constructor as typeof AtJSON;
    let schema = DocumentClass.schema.slice().concat([Parse]);
    let ConcreteAnnotation = schema.find(AnnotationClass => {
      let fullyQualifiedType = `-${AnnotationClass.vendorPrefix}-${AnnotationClass.type}`;
      return json.type === fullyQualifiedType;
    });

    if (ConcreteAnnotation) {
      return ConcreteAnnotation.hydrate(json);
    } else {
      return new Unknown({
        start: json.start,
        end: json.end,
        attributes: {
          type: json.type,
          attributes: json.attributes
        }
      });
    }
  }
}
