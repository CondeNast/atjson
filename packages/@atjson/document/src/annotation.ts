import uuid from "uuid-random";
import {
  AnnotationAttributesObject,
  Change,
  clone,
  Deletion,
  Document,
  EdgeBehaviour,
  Insertion,
  JSON,
  removeUndefinedValuesFromObject,
  toJSON,
  unprefix,
} from "./internals";

import * as Automerge from "automerge";

export interface AnnotationJSON {
  id?: string;
  type: string;
  start: number;
  startCursor: Automerge.Cursor;
  end: number;
  endCursor: Automerge.Cursor;
  attributes: JSON;
}

/**
 * AttributesOf returns a type that is the inferred attributes
 * of an annotation.
 *
 * If you're using Annotations with the ReactRenderer, you can
 * use the same types across your Annotations and Components.
 *
 * For example, a heading annotation:
 *
 * ```ts
 * import { BlockAnnotation } from '@atjson/document';
 *
 * export default Heading extends BlockAnnotation<{
 *   level: 1 | 2 | 3 | 4 | 5 | 6;
 * }> {
 *   static vendorPrefix = 'test';
 *   static type = 'heading';
 * }
 * ```
 *
 * You could then pull in the annotation and reuse it in React:
 *
 * ```ts
 * import * as React from 'react';
 * import { AttributesOf } from '@atjson/document';
 * import HeadingAnnotation from './heading';
 *
 * export const Heading: React.StatelessComponent<AttributesOf<HeadingAnnotation>> = () => {
 *   // React's propTypes are now { level: 1 | 2 | 3 | 4 | 5 | 6 }
 * };
 * ```
 */
export type AttributesOf<AnnotationClass> = AnnotationClass extends Annotation<
  infer Attributes
>
  ? Attributes
  : never;

function areAttributesEqual(
  lhsAnnotationAttributes: AnnotationAttributesObject,
  rhsAnnotationAttributes: AnnotationAttributesObject
): boolean {
  let hasUnEqualLengths =
    Object.keys(lhsAnnotationAttributes).length !==
    Object.keys(rhsAnnotationAttributes).length;
  if (hasUnEqualLengths) {
    return false;
  }

  for (let key in lhsAnnotationAttributes) {
    let lhsAttributeValue = lhsAnnotationAttributes[key];
    let rhsAttributeValue = rhsAnnotationAttributes[key];
    if (lhsAttributeValue !== rhsAttributeValue) {
      if (
        lhsAttributeValue instanceof Document &&
        rhsAttributeValue instanceof Document
      ) {
        let areNestedDocumentsEqual = lhsAttributeValue.equals(
          rhsAttributeValue
        );
        if (!areNestedDocumentsEqual) return false;
      } else if (
        typeof lhsAttributeValue === "object" &&
        typeof rhsAttributeValue === "object"
      ) {
        let areNestedAttributesEqual = areAttributesEqual(
          lhsAttributeValue,
          rhsAttributeValue
        );
        if (!areNestedAttributesEqual) return false;
      } else {
        return false;
      }
    }
  }
  return true;
}

export type ConcreteAnnotation<T extends Annotation<any>> = T;
export interface AnnotationConstructor<T, Attributes> {
  vendorPrefix: string;
  type: string;
  subdocuments: { [key: string]: typeof Document };
  new (attributes: {
    id?: string;
    startCursor: Automerge.Cursor;
    endCursor: Automerge.Cursor;
    attributes?: Attributes;
  }): T;
  hydrate(
    content: Automerge.Text,
    attrs: {
      id?: string;
      start: number;
      end: number;
      attributes: JSON;
    }
  ): T;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export abstract class Annotation<Attributes = {}> {
  static vendorPrefix: string;
  static type: string;
  static subdocuments: { [key: string]: typeof Document } = {};

  static hydrate(
    content: Automerge.Text,
    attrs: {
      id?: string;
      start: number;
      end: number;
      attributes: JSON;
    }
  ) {
    let startCursor = content.getCursorAt(attrs.start);
    let endCursor = content.getCursorAt(attrs.end);
    return new (this as any)({
      id: attrs.id,
      startCursor: startCursor,
      endCursor: endCursor,
      attributes: unprefix(
        this.vendorPrefix,
        this.subdocuments,
        attrs.attributes
      ),
    });
  }

  readonly type: string;
  readonly vendorPrefix: string;
  abstract get rank(): number;
  id: string;
  startCursor?: Automerge.Cursor;
  startStatic?: number;
  get start(): number {
    if (this.startCursor) {
      return this.startCursor.index;
    } else if (this.startStatic != undefined) {
      return this.startStatic;
    } else {
      throw new Error("No valid start position found!");
    }
  }
  endCursor?: Automerge.Cursor;
  endStatic?: number;
  get end(): number {
    if (this.endCursor) {
      return this.endCursor.index;
    } else if (this.endStatic != undefined) {
      return this.endStatic;
    } else {
      throw new Error("No valid end position found!");
    }
  }
  attributes: Attributes;

  constructor(attrs: {
    id?: string;
    startCursor: Automerge.Cursor;
    endCursor: Automerge.Cursor;
    attributes?: Attributes;
  }) {
    let AnnotationClass = this.getAnnotationConstructor();
    this.type = AnnotationClass.type;
    this.vendorPrefix = AnnotationClass.vendorPrefix;
    this.id = attrs.id || uuid();
    this.startCursor = attrs.startCursor;
    this.endCursor = attrs.endCursor;

    this.attributes = attrs.attributes || ({} as Attributes);
  }

  getAnnotationConstructor<T extends Annotation<Attributes>>(this: T) {
    return this.constructor as AnnotationConstructor<T, Attributes>;
  }

  isAlignedWith(annotation: Annotation<any>) {
    return this.start === annotation.start && this.end === annotation.end;
  }

  equals(annotationToCompare: Annotation<any>): boolean {
    let lhsAnnotationAttributes = removeUndefinedValuesFromObject(
      this.attributes
    );
    let rhsAnnotationAttributes = removeUndefinedValuesFromObject(
      annotationToCompare.attributes
    );

    return (
      this.start === annotationToCompare.start &&
      this.end === annotationToCompare.end &&
      this.type === annotationToCompare.type &&
      this.vendorPrefix === annotationToCompare.vendorPrefix &&
      areAttributesEqual(lhsAnnotationAttributes, rhsAnnotationAttributes)
    );
  }

  /**
   * nb. Currently, changes are applied directly to the document.
   *     In the future, we want to return a set of changes that
   *     are applied to the document including annotations.
   */
  handleChange(change: Change) {
    if (change.type === "insertion") {
      this.handleInsertion(change as Insertion);
    } else {
      this.handleDeletion(change as Deletion);
    }
  }

  handleCRDTDeletion(change: Deletion) {
    change;
    // no-op (so far)!
  }

  handleDeletion(change: Deletion) {
    if (this.startCursor) {
      return this.handleCRDTDeletion(change);
    }

    if (this.startStatic === undefined || this.endStatic == undefined) {
      throw new Error("well, this was unexpected");
    }

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
      this.startStatic -= length;
      this.endStatic -= length;
    } else {
      if (change.end < this.end) {
        // Annotation spans the whole deleted text, so just truncate the end of
        // the annotation (shrink from the right).
        //   [             ]
        // ------*------*---------
        if (change.start > this.start) {
          this.endStatic -= length;

          // Annotation occurs within the deleted text, affecting both start and
          // end of the annotation, but by only part of the deleted text length.
          //         [         ]
          // ---*---------*------------
        } else if (change.start <= this.start) {
          this.startStatic -= this.start - change.start;
          this.endStatic -= length;
        }
      } else if (change.end >= this.end) {
        //             [  ]
        //          [     ]
        //          [         ]
        //              [     ]
        //    ------*---------*--------
        if (change.start <= this.start) {
          this.startStatic = change.start;
          this.endStatic = change.start;

          //       [        ]
          //    ------*---------*--------
        } else if (change.start > this.start) {
          this.endStatic = change.start;
        }
      }
    }
  }

  handleCRDTInsertion(change: Insertion) {
    change;
    // no-op (so far)!
  }

  handleInsertion(change: Insertion) {
    if (this.startCursor) {
      return this.handleCRDTInsertion(change);
    }

    if (this.startStatic === undefined || this.endStatic == undefined) {
      throw new Error("well, this was unexpected");
    }

    let length = change.text.length;

    // The first two normal cases are self explanatory. Just adjust the annotation
    // position, since there is never a case where we wouldn't want to.
    if (change.start < this.start) {
      this.startStatic += length;
      this.endStatic += length;
    } else if (change.start > this.start && change.start < this.end) {
      this.endStatic += length;

      // When considering inserting text at a point adjacent to an annotation,
      // the edge behaviour dictates how adjacent annotations respond. With
      // "preserve", the existing annotation and its text are preserved. With
      // "modify", the existing annotation is modified to include the
      // newly-inserted text. See "insertText" docs for details.
    } else if (change.start === this.start) {
      if (change.behaviourLeading === EdgeBehaviour.preserve) {
        this.startStatic += length;
        this.endStatic += length;
      } else {
        this.endStatic += length;
      }
    } else if (change.start === this.end) {
      if (change.behaviourTrailing === EdgeBehaviour.modify) {
        this.endStatic += length;
      }
    }
  }

  clone() {
    let AnnotationClass = this.getAnnotationConstructor();

    return new AnnotationClass({
      id: this.id,
      startCursor: this.startCursor,
      endCursor: this.endCursor,
      attributes: clone(this.attributes),
    });
  }

  toJSON() {
    return {
      id: this.id,
      type: `-${this.vendorPrefix}-${this.type}`,
      start: this.start,
      end: this.end,
      attributes: toJSON(this.vendorPrefix, this.attributes),
    };
  }
}
