import Annotation from './annotation';
import { Attributes } from './attributes';
import BlockAnnotation from './block-annotation';
import Change, { AdjacentBoundaryBehaviour, Deletion, Insertion } from './change';
import AnnotationCollection from './collection';
import InlineAnnotation from './inline-annotation';
import Join from './join';
import ObjectAnnotation from './object-annotation';
import ParseAnnotation from './parse-annotation';


export type AnnotationConstructor<T extends Annotation> = new (options: { start: number, end: number, attributes: Attributes }) => T;

export interface AnnotationJSON {
  type: string;
  start: number;
  end: number;
  attributes: Attributes;
}

export { AdjacentBoundaryBehaviour, Annotation, AnnotationCollection, BlockAnnotation, Change, Deletion, InlineAnnotation, Insertion, Join, ObjectAnnotation, ParseAnnotation };

export type Schema<T extends Annotation> = T[];

export default class Document {
  static contentType: string;
  static schema: Schema<any>;

  content: string;
  readonly contentType: string;
  annotations: Annotation[];
  changeListeners: Array<() => void>;

  private pendingChangeEvent: any;

  constructor(options: { content: string, annotations: AnnotationJSON[] }) {
    let DocumentClass = this.constructor as typeof Document;
    this.content = options.content;
    this.contentType = DocumentClass.contentType;
    this.annotations = options.annotations.map(json => this.createAnnotation(json));
    this.changeListeners = [];
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
  addAnnotations(...annotations: AnnotationJSON[]): void {
    this.annotations.push(...annotations.map(json => this.createAnnotation(json)));
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
    let collection = new AnnotationCollection(this, this.annotations);
    return collection.where(filter);
  }

  removeAnnotation(annotation: Annotation): Annotation | void {
    let index = this.annotations.indexOf(annotation);
    if (index > -1) {
      this.triggerChange();
      return this.annotations.splice(index, 1)[0];
    }
  }

  replaceAnnotation(annotation: Annotation, ...newAnnotations: Annotation[]): void {
    let index = this.annotations.indexOf(annotation);
    if (index > -1) {
      this.annotations.splice(index, 1, ...newAnnotations);
    }
    this.triggerChange();
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
    let DocumentClass: any = this.constructor;
    let doc = new DocumentClass({
      content: this.content,
      annotations: this.annotations.map(a => a.toJSON())
    });

    doc.deleteText(0, start);
    doc.deleteText(end, doc.content.length);

    return doc;
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

  private createAnnotation(json: AnnotationJSON): Annotation | void {
    let DocumentClass = this.constructor as typeof Document;
    let schema = DocumentClass.schema.slice().concat([ParseAnnotation]);
    let ConcreteAnnotation = schema.find(AnnotationClass => {
      let fullyQualifiedType = `-${AnnotationClass.vendorPrefix}-${AnnotationClass.type}`;
      return json.type === fullyQualifiedType;
    });

    if (ConcreteAnnotation) {
      return new ConcreteAnnotation(json);
    }

    this.triggerChange();
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
