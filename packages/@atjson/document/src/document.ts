import {
  AdjacentBoundaryBehaviour,
  Annotation,
  AnnotationJSON,
  Collection,
  Deletion,
  EdgeBehaviour,
  Insertion,
  SchemaDefinition,
  ParseAnnotation,
  UnknownAnnotation,
  ValidAnnotations,
  AnnotationNamed,
  SchemaClasses,
  isValidType,
  sort,
  findAnnotationFor
} from "./internals";

function createAnnotation<Schema extends SchemaDefinition>(
  annotation: Annotation<any> | AnnotationJSON,
  schema: Schema
): ValidAnnotations<Schema> {
  let KnownAnnotation = findAnnotationFor(annotation, schema);
  if (annotation instanceof Annotation) {
    if (KnownAnnotation === annotation.constructor) {
      return annotation as ValidAnnotations<Schema>;
    } else {
      return KnownAnnotation.hydrate(annotation.toJSON());
    }
  } else {
    return KnownAnnotation.hydrate(annotation);
  }
}

/**
 * This function merges and sorts the provided ranges
 *
 * @param ranges list of { start, end } structs to sort and merge
 * @returns a list of non-overlapping { start, end } structs, sorted by start position
 */
export function mergeRanges(_ranges: Array<{ start: number; end: number }>) {
  if (_ranges.length === 0) return [];

  /**
   * shallowly clone the argument so we don't change the ordering
   */
  let ranges = [..._ranges];

  /**
   * sort the ranges in ascending order by start position
   * this allows us to efficiently merge them, which will allow us to efficiently delete text
   */
  let sortedRanges = ranges.sort(function compareRangeStarts(
    { start: startL },
    { start: startR }
  ) {
    return startL - startR;
  });

  /**
   * merge overlapping ranges so we don't need to worry about them when we're deleting text and adjusting annotations
   *
   * do this by passing over the sorted ranges (taking the first as a starting accumulator)
   * for each new range we see, if it overlaps *and* overhangs the current accumulator we extend the accumulator
   * if it doesn't overlap the current accumulator, we know it must come *after* the accumulator since the ranges are sorted
   * so we add the accumulator to the merged ranges and make the next range the new accumulator
   */
  let [{ start, end }, ...unmergedRanges] = sortedRanges;
  // copy the start and end positions into a new object we can modify freely
  let currentMergingRange = { start, end };
  let mergedRanges = [];

  for (let { start, end } of unmergedRanges) {
    // copy the start and end positions into a new object we can modify freely
    let range = { start, end };
    // if the new range overlaps and overhangs the current range, extend the current range
    if (range.start <= currentMergingRange.end) {
      if (range.end > currentMergingRange.end) {
        currentMergingRange.end = range.end;
      }
    } else {
      mergedRanges.push(currentMergingRange);
      currentMergingRange = range;
    }
  }

  mergedRanges.push(currentMergingRange);

  return mergedRanges;
}

export class Document<Schema extends SchemaDefinition> {
  content: string;
  annotations: ValidAnnotations<Schema>[];
  schema: Schema;
  changeListeners: Array<() => void>;

  private pendingChangeEvent: any;

  constructor(options: {
    content: string;
    annotations: Array<AnnotationJSON | Annotation<any>>;
    schema: Schema;
  }) {
    this.changeListeners = [];
    this.content = options.content;
    this.schema = options.schema;
    this.annotations = options.annotations.map(function reifyAnnotations(
      annotation
    ) {
      return createAnnotation(annotation, options.schema);
    });
  }

  /**
   * I'm on a plane; I'm not sure the best approach to cross-platform event
   * listeners and don't have internet access at the moment, so I'm just going
   * to quickly roll my own here. To be updated.
   */
  addEventListener(eventName: string, func: () => void): void {
    if (eventName !== "change")
      throw new Error("Unsupported event. `change` is the only constant.");
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
  addAnnotations(
    ...annotations: Array<Annotation<any> | AnnotationJSON>
  ): void {
    let reifyAnnotations = (annotation: AnnotationJSON | Annotation<any>) =>
      createAnnotation(annotation, this.schema);
    this.annotations.push(...annotations.map(reifyAnnotations));
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
  where<Name extends string>(
    className: Name
  ): Collection<Schema, InstanceType<AnnotationNamed<Schema, Name>>>;
  where<
    Type extends
      | SchemaClasses<Schema>
      | typeof ParseAnnotation
      | typeof UnknownAnnotation
  >(type: Type): Collection<Schema, InstanceType<Type>>;
  where(
    callback:
      | Partial<AnnotationJSON>
      | ((value: ValidAnnotations<Schema>) => unknown)
  ): Collection<Schema, ValidAnnotations<Schema>>;
  where<
    Type extends
      | SchemaClasses<Schema>
      | typeof ParseAnnotation
      | typeof UnknownAnnotation,
    Name extends string
  >(
    filter:
      | ((value: ValidAnnotations<Schema>) => boolean)
      | Partial<AnnotationJSON>
      | Name
      | Type
  ) {
    if (typeof filter === "string") {
      return new Collection(this, this.annotations).where(filter);
    } else if (isValidType(this.schema, filter)) {
      return new Collection(this, this.annotations).where(filter);
    } else if (filter instanceof Function) {
      return new Collection(this, this.annotations).where(filter);
    } else if (typeof filter === "object") {
      return new Collection(this, this.annotations).where(filter);
    } else {
      return new Collection(this, this.annotations).where(filter);
    }
  }

  all() {
    return new Collection(this, this.annotations);
  }

  removeAnnotation(annotation: Annotation<any>): Annotation<any> | void {
    let index = this.annotations.indexOf(annotation);
    if (index > -1) {
      this.triggerChange();
      return this.annotations.splice(index, 1)[0];
    }
  }

  removeAnnotations(_annotations: Array<Annotation<any>>) {
    if (_annotations.length < 10) {
      for (let annotation of _annotations) {
        this.removeAnnotation(annotation);
      }

      return;
    }

    /**
     * shallowly clone the argument so we don't change the order or remove elements
     */
    let annotations = [..._annotations];

    let sortedAnnotationsToRemove = annotations.sort(sort);
    let docAnnotations = this.annotations.sort(sort);

    let keptAnnotations = [];
    for (let annotation of docAnnotations) {
      if (annotation === sortedAnnotationsToRemove[0]) {
        sortedAnnotationsToRemove.shift();
      } else {
        keptAnnotations.push(annotation);
      }
    }

    this.annotations = keptAnnotations;
    this.triggerChange();
  }

  replaceAnnotation(
    annotation: ValidAnnotations<Schema>,
    ...newAnnotations: Array<AnnotationJSON | Annotation<any>>
  ) {
    let index = this.annotations.indexOf(annotation);
    let reifyAnnotations = (annotation: AnnotationJSON | Annotation<any>) =>
      createAnnotation(annotation, this.schema);
    if (index > -1) {
      let annotations = newAnnotations.map(reifyAnnotations);
      this.annotations.splice(index, 1, ...annotations);
      return annotations;
    }

    this.triggerChange();
    return [];
  }

  insertText(
    start: number,
    text: string,
    behaviour: AdjacentBoundaryBehaviour = AdjacentBoundaryBehaviour.default
  ) {
    if (start < 0 || start > this.content.length)
      throw new Error("Invalid position.");

    let behaviourLeading;
    let behaviourTrailing;
    // "preserve" and "modify" are targeted for deprecation as valid options in
    // favor of preserveLeading, preserveTrailing, or preserveBoth
    switch (behaviour) {
      case AdjacentBoundaryBehaviour.preserveBoth:
        behaviourLeading = EdgeBehaviour.preserve;
        behaviourTrailing = EdgeBehaviour.preserve;
        break;
      case AdjacentBoundaryBehaviour.preserve:
      case AdjacentBoundaryBehaviour.preserveTrailing:
        behaviourLeading = EdgeBehaviour.modify;
        behaviourTrailing = EdgeBehaviour.preserve;
        break;
      default:
      case AdjacentBoundaryBehaviour.modify:
      case AdjacentBoundaryBehaviour.preserveLeading:
        behaviourLeading = EdgeBehaviour.preserve;
        behaviourTrailing = EdgeBehaviour.modify;
        break;
    }

    let insertion = new Insertion(
      start,
      text,
      behaviourLeading,
      behaviourTrailing
    );

    try {
      for (let i = this.annotations.length - 1; i >= 0; i--) {
        let annotation = this.annotations[i];
        annotation.handleChange(insertion);
      }

      this.content =
        this.content.slice(0, start) + text + this.content.slice(start);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to insert text", e);
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

  deleteText(start: number, end: number) {
    // This should really not just truncate annotations, but rather tombstone
    // the modified annotations as an atjson sub-document inside the annotation
    // that's being used to delete stuff.
    let deletion = new Deletion(start, end);
    try {
      for (let i = this.annotations.length - 1; i >= 0; i--) {
        let annotation = this.annotations[i];
        annotation.handleChange(deletion);
      }
      this.content = this.content.slice(0, start) + this.content.slice(end);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to delete text", e);
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
  slice(start: number, end: number) {
    let slicedAnnotations = this.where(function sliceContainsAnnotation(a) {
      if (start < a.start) {
        return end > a.start;
      } else {
        return a.end > start;
      }
    });

    let doc = new Document({
      content: this.content,
      annotations: slicedAnnotations.map(function cloneAnnotation(annotation) {
        return annotation.clone();
      }),
      schema: this.schema
    });
    doc.deleteText(end, doc.content.length);
    doc.deleteText(0, start);

    return doc;
  }

  /**
   * Cuts out part of the document, modifying `this` and returning the removed portion
   */
  cut(start: number, end: number) {
    let slice = this.slice(start, end);
    this.where(function annotationWasCut(annotation) {
      return annotation.start >= start && annotation.end <= end;
    }).remove();
    this.deleteText(start, end);

    return slice;
  }

  toJSON() {
    return {
      content: this.content,
      annotations: this.where({})
        .sort()
        .toJSON(),
      schema: Object.values(this.schema.annotations).map(
        function prefixAnnotationType(AnnotationClass) {
          return `-${AnnotationClass.vendorPrefix}-${AnnotationClass.type}`;
        }
      )
    };
  }

  clone() {
    return new Document({
      content: this.content,
      annotations: this.annotations.map(function cloneAnnotation(annotation) {
        return annotation.clone();
      }),
      schema: this.schema
    });
  }

  match(
    regex: RegExp,
    start?: number,
    end?: number
  ): Array<{ start: number; end: number; matches: string[] }> {
    let content = this.content.slice(start, end);
    let offset = start || 0;
    let matches = [];

    let match;
    do {
      match = regex.exec(content);
      if (match) {
        matches.push({
          start: offset + match.index,
          end: offset + match.index + match[0].length,
          matches: match.slice()
        });
      }
    } while (regex.global && match);

    return matches;
  }

  deleteTextRanges(ranges: Array<{ start: number; end: number }>) {
    if (ranges.length === 0) {
      return;
    }

    /**
     * sorts and merges ranges so that they are non-overlapping and in ascending order by start value
     */
    let mergedRanges = mergeRanges(ranges);

    if (mergedRanges.length === 1) {
      let [{ start, end }] = mergedRanges;
      return this.deleteText(start, end);
    }

    /**
     * because the ranges are now *sorted* and *non-overlapping* we can straightforwardly extract the text *between* the ranges,
     * join the extracted text, and make that our new content.
     */
    let newContent = this.content.slice(0, mergedRanges[0].start);
    let lastEnd;
    for (let i = 0; i < mergedRanges.length - 1; i++) {
      newContent += this.content.slice(
        mergedRanges[i].end,
        mergedRanges[i + 1].start
      );
      lastEnd = mergedRanges[i + 1].end;
    }

    this.content = newContent + this.content.slice(lastEnd);

    /**
     * for adjusting annotations, we need to handle the ranges backwards.
     * Conveniently they are already sorted and non-overlapping, so we can simply walk the list backwards
     */

    for (let i = mergedRanges.length - 1; i >= 0; i--) {
      let change = mergedRanges[i];

      for (let annotation of this.annotations) {
        let length = change.end - change.start;

        // We're deleting after the annotation, nothing needed to be done.
        //    [   ]
        // -----------*---*---
        if (annotation.end < change.start) {
          continue;
        }

        // If the annotation is wholly *after* the deleted text, just move
        // everything.
        //           [       ]
        // --*---*-------------
        if (change.end < annotation.start) {
          annotation.start -= length;
          annotation.end -= length;
        } else {
          if (change.end < annotation.end) {
            // Annotation spans the whole deleted text, so just truncate the end of
            // the annotation (shrink from the right).
            //   [             ]
            // ------*------*---------
            if (change.start > annotation.start) {
              annotation.end -= length;

              // Annotation occurs within the deleted text, affecting both start and
              // end of the annotation, but by only part of the deleted text length.
              //         [         ]
              // ---*---------*------------
            } else if (change.start <= annotation.start) {
              annotation.start -= annotation.start - change.start;
              annotation.end -= length;
            }
          } else if (change.end >= annotation.end) {
            //             [  ]
            //          [     ]
            //          [         ]
            //              [     ]
            //    ------*---------*--------
            if (change.start <= annotation.start) {
              annotation.start = change.start;
              annotation.end = change.start;

              //       [        ]
              //    ------*---------*--------
            } else if (change.start > annotation.start) {
              annotation.end = change.start;
            }
          }
        }
      }
    }

    this.triggerChange();
  }

  canonical() {
    let canonicalDoc = this.clone();
    let parseTokensToDelete = [];

    for (let annotation of canonicalDoc.annotations) {
      let vendorPrefix = annotation.vendorPrefix;
      if (vendorPrefix === "atjson" && annotation.type === "parse-token") {
        parseTokensToDelete.push(annotation);
      }
    }

    canonicalDoc.removeAnnotations(parseTokensToDelete);
    canonicalDoc.deleteTextRanges(parseTokensToDelete);

    canonicalDoc.annotations.sort(sort);

    return canonicalDoc;
  }

  equals(docToCompare: Document<Schema>): boolean {
    let canonicalLeftHandSideDoc = this.canonical();
    let canonicalRightHandSideDoc = docToCompare.canonical();

    let isContentEqual =
      canonicalLeftHandSideDoc.content === canonicalRightHandSideDoc.content;
    if (!isContentEqual) {
      return false;
    }
    let isAnnotationLengthEqual =
      canonicalLeftHandSideDoc.annotations.length ===
      canonicalRightHandSideDoc.annotations.length;
    if (!isAnnotationLengthEqual) {
      return false;
    }

    return canonicalLeftHandSideDoc.annotations.every(
      function matchesRightHandDocAnnotationAtIndex(lhsAnnotation, index) {
        return lhsAnnotation.equals(
          canonicalRightHandSideDoc.annotations[index]
        );
      }
    );
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
    let notifyListeners = () => {
      for (let listener of this.changeListeners) {
        listener();
      }
      delete this.pendingChangeEvent;
    };
    this.pendingChangeEvent = setTimeout(notifyListeners, 0);
  }
}
