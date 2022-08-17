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
  withStableIds,
} from "./internals";

export interface AnnotationJSON {
  id?: string;
  type: string;
  start: number;
  end: number;
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
        let areNestedDocumentsEqual =
          lhsAttributeValue.equals(rhsAttributeValue);
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
    start: number;
    end: number;
    attributes?: Attributes;
  }): T;
  hydrate(attrs: {
    id?: string;
    start: number;
    end: number;
    attributes: JSON;
  }): T;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export abstract class Annotation<Attributes = {}> {
  static vendorPrefix: string;
  static type: string;
  /**
   * Subdocuments are a legacy way of embedding additional
   * text. We recommend using slices for this instead and
   * embedding the subdocument in the parent document.
   * @deprecated Use slices instead
   */
  static subdocuments: { [key: string]: typeof Document } = {};

  static hydrate(attrs: {
    id?: string;
    start: number;
    end: number;
    attributes: JSON;
  }) {
    return new (this as any)({
      id: attrs.id,
      start: attrs.start,
      end: attrs.end,
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
  start: number;
  end: number;
  attributes: Attributes;

  constructor(attrs: {
    id?: string;
    start: number;
    end: number;
    attributes?: Attributes;
  }) {
    let AnnotationClass = this.getAnnotationConstructor();
    this.type = AnnotationClass.type;
    this.vendorPrefix = AnnotationClass.vendorPrefix;
    this.id = attrs.id || uuid();
    this.start = attrs.start;
    this.end = attrs.end;

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

      // When considering inserting text at a point adjacent to an annotation,
      // the edge behaviour dictates how adjacent annotations respond. With
      // "preserve", the existing annotation and its text are preserved. With
      // "modify", the existing annotation is modified to include the
      // newly-inserted text. See "insertText" docs for details.
    } else if (change.start === this.start) {
      if (change.behaviourLeading === EdgeBehaviour.preserve) {
        this.start += length;
        this.end += length;
      } else {
        this.end += length;
      }
    } else if (change.start === this.end) {
      if (change.behaviourTrailing === EdgeBehaviour.modify) {
        this.end += length;
      }
    }
  }

  clone() {
    let AnnotationClass = this.getAnnotationConstructor();

    return new AnnotationClass({
      id: this.id,
      start: this.start,
      end: this.end,
      attributes: clone(this.attributes),
    });
  }

  withStableIds(ids: Record<string, string>) {
    let AnnotationClass = this.getAnnotationConstructor();

    return new AnnotationClass({
      id: ids[this.id],
      start: this.start,
      end: this.end,
      attributes: withStableIds(this.attributes, ids),
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
