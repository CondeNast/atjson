import Annotation, { AnnotationConstructor } from './annotation';
import { BlockAnnotation, InlineAnnotation, ObjectAnnotation, ParseAnnotation, UnknownAnnotation } from './annotations';
import Change, { AdjacentBoundaryBehaviour, Deletion, Insertion } from './change';
import AnnotationCollection from './collection';
import Join from './join';
import JSON from './json';

export interface AnnotationJSON {
  id?: string;
  type: string;
  start: number;
  end: number;
  attributes: JSON;
}

export {
  AdjacentBoundaryBehaviour,
  Annotation,
  AnnotationCollection,
  AnnotationConstructor,
  BlockAnnotation,
  Change,
  Deletion,
  InlineAnnotation,
  Insertion,
  JSON,
  ObjectAnnotation,
  Join,
  ParseAnnotation,
  UnknownAnnotation
};

export default class Document {
  static contentType: string;
  static schema: AnnotationConstructor[] = [];
  static converters: WeakMap<typeof Document, (doc: Document) => Document>;

  static defineConverterTo(to: typeof Document, converter: (doc: Document) => Document) {
    if (this.converters == null) {
      this.converters = new WeakMap();
    }
    this.converters.set(to, converter);
  }

  content: string;
  readonly contentType: string;
  annotations: Annotation[];
  changeListeners: Array<() => void>;

  private pendingChangeEvent: any;

  constructor(options: { content: string, annotations: AnnotationJSON[] }) {
    let DocumentClass = this.constructor as typeof Document;
    this.contentType = DocumentClass.contentType;
    this.changeListeners = [];
    this.content = options.content;
    this.annotations = options.annotations.map(annotation => this.createAnnotation(annotation));
  }

  /**
   * I'm on a plane; I'm not sure the best approach to cross-platform event
   * listeners and don't have internet access at the moment, so I'm just going
   * to quickly roll my own here. To be updated.
   */
  addEventListener(eventName: string, func: () => void): void {
    if (eventName !== 'change') throw new Error('Unsupported event. `change` is the only constant.');
    this.changeListeners.push(func);
  }

  /*
  removeEventListener(eventName: string, func: Function): void {
    throw new Error('Unimplemented.');
  }
  */

  /**
   * Annotations must be explicitly allowed unless they
   * are added to the annotations array directly- this is
   * acceptable, but side-affects created by queries will
   * not be called.
   */
  addAnnotations(...annotations: Array<Annotation | AnnotationJSON>): void {
    this.annotations.push(...annotations.map(annotation => this.createAnnotation(annotation)));
    this.triggerChange();
  }

  /**
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
   *
   * tk: join documentation
   */
  where(filter: { [key: string]: any; } | ((annotation: Annotation) => boolean)) {
    return this.all().where(filter);
  }

  all() {
    return new AnnotationCollection(this, this.annotations);
  }

  removeAnnotation(annotation: Annotation): Annotation | void {
    let index = this.annotations.indexOf(annotation);
    if (index > -1) {
      this.triggerChange();
      return this.annotations.splice(index, 1)[0];
    }
  }

  replaceAnnotation(annotation: Annotation, ...newAnnotations: Array<AnnotationJSON | Annotation>): Annotation[] {
    let index = this.annotations.indexOf(annotation);
    if (index > -1) {
      let annotations = newAnnotations.map(newAnnotation => this.createAnnotation(newAnnotation));
      this.annotations.splice(index, 1, ...annotations);
      return annotations;
    }

    this.triggerChange();
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

    /*
        if (text.indexOf('\n') > -1) {
      let prevEnd: number;
      for (let j = this.annotations.length - 1; j >= 0; j--) {
        a = this.annotations[j];

        // This doesn't affect us.
        if (a.type !== 'block') continue;
        if (a.end < position) continue;
        if (position < a.start) continue;

        // First adjust the end of the current paragraph.
        prevEnd = a.end;
        a.end = position + 1;

        // And now add a new paragraph.
        this.addAnnotations({
          type: 'paragraph',
          display: 'block',
          start: position + 1,
          end: prevEnd
        });
      }
    }
    */
    this.triggerChange();
  }

  deleteText(start: number, end: number, behaviour: AdjacentBoundaryBehaviour = AdjacentBoundaryBehaviour.default) {
    // This should really not just truncate annotations, but rather tombstone
    // the modified annotations as an atjson sub-document inside the annotation
    // that's being used to delete stuff.
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

    /* to be moved to block annotation
      let potentialMergeAnnotations = { type: annotations[] }
      for (const type in potentialMergeAnnotations) {
        let annotations = potentialMergeAnnotations[type];
        annotations = annotations.sort((j, k) => j.start - k.start);
        for (let l = annotations.length - 1; l > 0; l--) {
          if (annotations[l - 1].end === annotations[l].start) { // && annotations[i-1].attributes.toJSON() === annotations[i].attributes.toJSON()) {
            annotations[l - 1].end = annotations[l].end;
            this.removeAnnotation(annotations[l]);
          }
        }
        */

    this.triggerChange();
  }

  /**
   * Slices return part of a document from the parent document.
   */
  slice(start: number, end: number): Document {
    let doc = this.clone();
    doc.deleteText(0, start);
    doc.deleteText(end, doc.content.length);

    return doc;
  }

  convertTo<To extends typeof Document>(to: To): InstanceType<To> {
    let DocumentClass = this.constructor as typeof Document;
    let converters = DocumentClass.converters;
    let converter = converters && converters.get(to);

    // From === To
    if (to === DocumentClass) {
      return this.clone() as InstanceType<To>;
    // Coerce or convert to new type
    } else {
      let convertedDoc = this.clone();

      if (converter) {
        return new to(converter(convertedDoc).toJSON()) as InstanceType<To>;
      }
      return new to(convertedDoc.toJSON()) as InstanceType<To>;
    }
  }

  toJSON() {
    let DocumentClass = this.constructor as typeof Document;
    let schema = DocumentClass.schema;

    return {
      content: this.content,
      contentType: this.contentType,
      annotations: this.annotations.map(a => a.toJSON()),
      schema: schema.map(AnnotationClass => `-${AnnotationClass.vendorPrefix}-${AnnotationClass.type}`)
    };
  }

  clone(): Document {
    let DocumentClass = this.constructor as typeof Document;
    return new DocumentClass(this.toJSON());
  }

  private createAnnotation(annotation: Annotation | AnnotationJSON): Annotation {
    let DocumentClass = this.constructor as typeof Document;
    let schema = [...DocumentClass.schema, ParseAnnotation];

    if (annotation instanceof Annotation) {
      let AnnotationClass = annotation.constructor as AnnotationConstructor;
      if (schema.indexOf(AnnotationClass) === -1) {
        let json = annotation.toJSON();
        return new UnknownAnnotation({
          id: json.id,
          start: json.start,
          end: json.end,
          attributes: {
            type: json.type,
            attributes: json.attributes
          }
        });
      }
      return annotation;
    } else {
      let ConcreteAnnotation = schema.find(AnnotationClass => {
        let fullyQualifiedType = `-${AnnotationClass.vendorPrefix}-${AnnotationClass.type}`;
        return annotation.type === fullyQualifiedType;
      });

      if (ConcreteAnnotation) {
        return ConcreteAnnotation.hydrate(annotation);
      } else {
        return new UnknownAnnotation({
          id: annotation.id,
          start: annotation.start,
          end: annotation.end,
          attributes: {
            type: annotation.type,
            attributes: annotation.attributes
          }
        });
      }
    }
  }

  /**
   * This is really coarse, just enough to allow different code in the editor to detect
   * changes in the document without handling that change management separately.
   *
   * Eventually it should be possible to handle this transactionally, but for
   * now we batch all changes enacted within one cycle of the event loop and
   * fire the change event only once. n.b that we don't send any information
   * about the changes here yet, but that's not to say we couldn't, but rather
   * it's not clear right now what the best approach would be so it's left
   * undefined.
   */
  private triggerChange() {
    if (this.pendingChangeEvent) return;
    this.pendingChangeEvent = setTimeout(_ => {
      this.changeListeners.forEach(l => l());
      delete this.pendingChangeEvent;
    }, 0);
  }
}
