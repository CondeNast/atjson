import { toJSON, unprefix } from './attributes';
import Change, { AdjacentBoundaryBehaviour, Deletion, Insertion } from './change';
import Document from './index';
import JSON from './json';

export type ConcreteAnnotation<T extends Annotation> = T;
export interface AnnotationConstructor {
  vendorPrefix: string;
  type: string;
  subdocuments: { [key: string]: typeof Document };
  new(attributes: { id: string, start: number, end: number, attributes: NonNullable<any> }): Annotation;
  hydrate(attrs: { id: string, start: number, end: number, attributes: JSON }): Annotation;
}

export default abstract class Annotation {
  static vendorPrefix: string;
  static type: string;
  static subdocuments: { [key: string]: typeof Document } = {};

  static hydrate(
    this: AnnotationConstructor,
    attrs: { id: string, start: number, end: number, attributes: JSON }
  ) {
    return new this({
      id: attrs.id,
      start: attrs.start,
      end: attrs.end,
      attributes: unprefix(this.vendorPrefix, this.subdocuments, attrs.attributes)
    });
  }

  readonly type: string;
  abstract rank: number;
  id: string;
  start: number;
  end: number;
  attributes: NonNullable<any>;

  constructor(attrs: { id: string, start: number, end: number, attributes: NonNullable<any> }) {
    let AnnotationClass = this.constructor as AnnotationConstructor;
    this.type = AnnotationClass.type;
    this.id = attrs.id;
    this.start = attrs.start;
    this.end = attrs.end;

    this.attributes = attrs.attributes;
  }

  /**
   * nb. Currently, changes are applied directly to the document.
   *     In the future, we want to return a set of changes that
   *     are applied to the document including annotations.
   */
  handleChange(change: Change) {
    if (change.type === 'insertion') {
      this.handleInsertion(change as Insertion);
    } else {
      this.handleDeletion(change as Deletion);
    }
  }

  handleDeletion(change: Deletion) {
    let length = change.end - change.start;

    // We're deleting after the annotation, nothing needed to be done.
    //    [   ]
    // -----------*---*---
    if (this.end < change.start) return;

    // If the annotation is wholly *after* the deleted text, just move
    // everything.
    //           [       ]
    // --*---*-------------
    if (change.end < this.start) {
      this.start -= length;
      this.end -= length;

    } else {

      if (change.end < this.end) {

        // Annotation spans the whole deleted text, so just truncate the end of
        // the annotation (shrink from the right).
        //   [             ]
        // ------*------*---------
        if (change.start > this.start) {
          this.end -= length;

        // Annotation occurs within the deleted text, affecting both start and
        // end of the annotation, but by only part of the deleted text length.
        //         [         ]
        // ---*---------*------------
        } else if (change.start <= this.start) {
          this.start -= this.start - change.start;
          this.end -= length;
        }

      } else if (change.end >= this.end) {

        //             [  ]
        //          [     ]
        //          [         ]
        //              [     ]
        //    ------*---------*--------
        if (change.start <= this.start) {
          this.start = change.start;
          this.end = change.start;

        //       [        ]
        //    ------*---------*--------
        } else if (change.start > this.start) {
          this.end = change.start;
        }
      }
    }
  }

  handleInsertion(change: Insertion) {
    let length = change.text.length;

    // The first two normal cases are self explanatory. Just adjust the annotation
    // position, since there is never a case where we wouldn't want to.
    if (change.start < this.start) {
      this.start += length;
      this.end += length;
    } else if (change.start > this.start && change.start < this.end) {
      this.end += length;

    // In this case, however, the normal behaviour when inserting text at a
    // point adjacent to an annotation is to drag along the end of the
    // annotation, or push forward the beginning, i.e., the transform happens
    // _inside_ an annotation to the left, or _outside_ an annotation to the right.
    //
    // Sometimes, the desire is to change the direction; this is provided below
    // with the preserveAdjacentBoundaries switch.

    // Default edge behaviour.
    } else if (change.behaviour === AdjacentBoundaryBehaviour.default) {
      if (change.start === this.start) {
        this.start += length;
        this.end += length;
      } else if (change.start === this.end) {
        this.end += length;
      }

    // Non-standard behaviour. Do nothing to the adjacent boundary!
    } else if (change.behaviour === AdjacentBoundaryBehaviour.preserve && change.start === this.start) {
      this.end += length;

    // no-op; we would delete the annotation, but we should defer to the
    // annotation as to whether or not it's deletable, since some zero-length
    // annotations should be retained.
    // n.b. the += 0 is just to silence tslint ;-)
    } else if (change.start === this.end)  {
      this.end += 0;
    }
  }

  clone() {
    let AnnotationClass = this.constructor as AnnotationConstructor;
    return AnnotationClass.hydrate(this.toJSON());
  }

  toJSON() {
    let AnnotationClass = this.constructor as AnnotationConstructor;
    let vendorPrefix = AnnotationClass.vendorPrefix;
    return {
      id: this.id,
      type: `-${vendorPrefix}-${this.type}`,
      start: this.start,
      end: this.end,
      attributes: toJSON(vendorPrefix, this.attributes)
    };
  }
}
