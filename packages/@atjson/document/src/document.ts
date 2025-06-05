import {
  AdjacentBoundaryBehaviour,
  Annotation,
  AnnotationCollection,
  AnnotationConstructor,
  AnnotationJSON,
  compareAnnotations,
  Deletion,
  EdgeBehaviour,
  Insertion,
  JSONEquals,
  ParseAnnotation,
  serialize,
  SliceAnnotation,
  TextAnnotation,
  UnknownAnnotation,
} from "./internals";

/**
 * Get the function that converts between two documents. Use this to grab a converter
 * for testing, or for nesting conversions.
 *
 * the converter returned from this will in general mutate its argument;
 * you should probably use convertTo unless you're in the middle of defining a converter
 */
export function getConverterFor(
  from: typeof Document | string,
  to: typeof Document | string
): never | ((doc: Document) => Document) {
  let exports = (typeof window !== "undefined" ? window : global) as any;
  let fromType = typeof from === "string" ? from : from.contentType;
  let toType = typeof to === "string" ? to : to.contentType;

  let converters = exports.__atjson_converters__;
  let converter = converters
    ? converters[fromType]
      ? converters[fromType][toType]
      : null
    : null;

  if (converter == null) {
    let fromName = typeof from === "string" ? from : from.name;
    let toName = typeof to === "string" ? to : to.name;
    throw new Error(
      `🚨 There is no converter registered between ${fromName} and ${toName}.\n\nDid you forget to \`import\` or \`require\` your converter?\n\nIf you haven't written a converter yet, register a converter for this:\n\n${fromName}.defineConverterTo(${toName}, doc => {\n  // ❤️ Write your converter here!\n  return doc;\n});`
    );
  }

  return converter;
}

/**
 * Get the function that converts between two documents. Use this to grab a converter
 * for testing, or for nesting conversions.
 *
 * the converter returned from this will in general mutate its argument;
 * you should probably use convertTo unless you're in the middle of defining a converter
 */
export function getConverterClassFor(
  from: typeof Document | string,
  to: typeof Document | string
): null | typeof Document {
  let exports = (typeof window !== "undefined" ? window : global) as any;
  let fromType = typeof from === "string" ? from : from.contentType;
  let toType = typeof to === "string" ? to : to.contentType;

  let converters = exports.__atjson_converter_classes__;
  return converters
    ? converters[fromType]
      ? converters[fromType][toType]
      : null
    : null;
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

export class Document {
  static contentType: string;
  static schema: Array<AnnotationConstructor<any, any>> = [];

  static defineConverterTo(
    to: typeof Document,
    converter: (doc: Document) => Document
  ) {
    // We may have multiple / conflicting versions of
    // @atjson/document. To allow this, we need to
    // register converters on the global to ensure
    // that they can be shared across versions of the library.
    let exports = (typeof window !== "undefined" ? window : global) as any;

    let converters = exports.__atjson_converters__;
    let converterClasses = exports.__atjson_converter_classes__;
    if (converters == null) {
      converters = exports.__atjson_converters__ = {};
      converterClasses = exports.__atjson_converter_classes__ = {};
    }

    if (converters[this.contentType] == null) {
      converters[this.contentType] = {};
      converterClasses[this.contentType] = {};
    }

    if (!(to.prototype instanceof Document)) {
      throw new Error(
        `📦 We've detected that you have multiple versions of \`@atjson/document\` installed— ${to.name} doesn't extend the same Document class as ${this.name}.\nThis may be because @atjson/document is being installed as a sub-dependency of an npm package and as a top-level package, and their versions don't match. It could also be that your build includes two versions of @atjson/document.`
      );
    }
    converters[this.contentType][to.contentType] = converter;

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let DocumentClass = this;
    class ConversionDocument extends DocumentClass {
      static schema = [...DocumentClass.schema, ...to.schema];

      /**
       * overrides Document.slice to return the result in the original source
       */
      slice(
        start: number,
        end: number,
        filter?: (annotation: Annotation<any>) => boolean
      ): Document {
        let sliceDoc = super.slice(start, end, filter);

        return new DocumentClass({
          content: sliceDoc.content,
          annotations: sliceDoc.annotations,
        });
      }

      convertTo<Other extends typeof Document>(other: Other): never {
        throw new Error(
          `🚨 Don't nest converters! Instead, import \`getConverterFor\` and get the converter that way!\n\nimport { getConverterFor } from '@atjson/document';\n\n${
            DocumentClass.name
          }.defineConverterTo(${
            to.name
          }, doc => {\n  let convert${other.name.replace(
            "Source",
            ""
          )} = getConverterFor(${other.name}, ${
            to.name
          });\n  return convert${other.name.replace("Source", "")}(doc);\n});`
        );
      }
    }
    converterClasses[this.contentType][to.contentType] = ConversionDocument;
  }

  content: string;
  readonly contentType: string;
  annotations: Array<Annotation<any>>;
  changeListeners: Array<() => void>;

  private pendingChangeEvent: any;

  constructor(options: {
    content: string;
    annotations: Array<AnnotationJSON | Annotation<any>>;
  }) {
    let DocumentClass = this.constructor as typeof Document;
    this.contentType = DocumentClass.contentType;
    this.changeListeners = [];
    this.content = options.content;

    let createAnnotation = (annotation: AnnotationJSON | Annotation<any>) =>
      this.createAnnotation(annotation);
    this.annotations = options.annotations.map(createAnnotation);
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
    let createAnnotation = (annotation: AnnotationJSON | Annotation<any>) =>
      this.createAnnotation(annotation);
    this.annotations.push(...annotations.map(createAnnotation));
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
  where(
    filter: { [key: string]: any } | ((annotation: Annotation<any>) => boolean)
  ) {
    return this.all().where(filter);
  }

  all() {
    return new AnnotationCollection(this, this.annotations);
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

    let sortedAnnotationsToRemove = annotations.sort(compareAnnotations);
    let docAnnotations = this.annotations.sort(compareAnnotations);

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
    annotation: Annotation<any>,
    ...newAnnotations: Array<AnnotationJSON | Annotation<any>>
  ): Array<Annotation<any>> {
    let index = this.annotations.indexOf(annotation);
    let createAnnotation = (annotation: AnnotationJSON | Annotation<any>) =>
      this.createAnnotation(annotation);
    if (index > -1) {
      let annotations = newAnnotations.map(createAnnotation);
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
   * By default, the slice contains a truncated copy of any annotation
   * overlapping the range. This can be overriden by specifying a filter
   */
  slice(
    start: number,
    end: number,
    filter?: (annotation: Annotation<any>) => boolean
  ): Document {
    let DocumentClass = this.constructor as typeof Document;
    let slicedAnnotations = filter
      ? this.where(filter)
      : this.where(function sliceContainsAnnotation(a) {
          if (start < a.start) {
            return end > a.start;
          } else {
            return a.end > start;
          }
        });

    let doc = new DocumentClass({
      content: this.content,
      annotations: slicedAnnotations.map(function cloneAnnotation(annotation) {
        return annotation.clone();
      }),
    });
    doc.deleteText(end, doc.content.length);
    doc.deleteText(0, start);

    return doc;
  }

  /**
   * Cuts out part of the document, modifying `this` and returning the removed portion.
   * By default, the cut contains a truncated copy of any annotation
   * overlapping the range. This can be overriden by specifying a filter.
   * Annotations included wholly in the cut that are matched by the filter
   * will be removed from the original document
   */
  cut(
    start: number,
    end: number,
    filter?: (annotation: Annotation<any>) => boolean
  ): Document {
    let slice = this.slice(start, end, filter);
    this.where(function annotationWasCut(annotation) {
      return (
        annotation.start >= start &&
        annotation.end <= end &&
        (!filter || filter(annotation))
      );
    }).remove();
    this.deleteText(start, end);

    return slice;
  }

  convertTo<To extends typeof Document>(to: To): InstanceType<To> | never {
    let DocumentClass = this.constructor as typeof Document;
    let converter = getConverterFor(DocumentClass, to);
    let ConversionDocument = getConverterClassFor(DocumentClass, to);
    if (ConversionDocument == null) {
      throw new Error(
        `No converter found between ${this.contentType} and ${to.contentType}`
      );
    }

    let convertedDoc = new ConversionDocument({
      content: this.content,
      annotations: this.where({})
        .sort()
        .map(function cloneAnnotation(a) {
          return a.clone();
        }),
    });

    let result = converter(convertedDoc);
    return new to({
      content: result.content,
      annotations: result.where({}).sort().annotations,
    }) as InstanceType<To>;
  }

  toJSON() {
    let DocumentClass = this.constructor as typeof Document;
    let schema = DocumentClass.schema;

    return {
      content: this.content,
      contentType: this.contentType,
      annotations: this.where({}).sort().toJSON(),
      schema: schema.map(function prefixAnnotationType(AnnotationClass) {
        return `-${AnnotationClass.vendorPrefix}-${AnnotationClass.type}`;
      }),
    };
  }

  clone(): Document {
    let DocumentClass = this.constructor as typeof Document;
    return new DocumentClass({
      content: this.content,
      annotations: this.annotations.map(function cloneAnnotation(annotation) {
        return annotation.clone();
      }),
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
          matches: match.slice(),
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

    // preserve order in the original document before
    // modifying it, as deleting text ranges may collapse
    // annotations onto each other
    canonicalDoc.annotations.sort(compareAnnotations);

    for (let annotation of canonicalDoc.annotations) {
      if (
        annotation.vendorPrefix === "atjson" &&
        annotation.type === "parse-token"
      ) {
        parseTokensToDelete.push(annotation);
      }
    }

    canonicalDoc.removeAnnotations(parseTokensToDelete);
    canonicalDoc.deleteTextRanges(parseTokensToDelete);

    return canonicalDoc;
  }

  equals(docToCompare: Document): boolean {
    let canonicalLeftHandSideDoc = serialize(this, { withStableIds: true });
    let canonicalRightHandSideDoc = serialize(docToCompare, {
      withStableIds: true,
    });

    let isContentEqual =
      canonicalLeftHandSideDoc.text === canonicalRightHandSideDoc.text;
    if (!isContentEqual) {
      return false;
    }

    let isBlockLengthEqual =
      canonicalLeftHandSideDoc.blocks.length ===
      canonicalRightHandSideDoc.blocks.length;
    if (!isBlockLengthEqual) {
      return false;
    }

    let isMarkLengthEqual =
      canonicalLeftHandSideDoc.marks.length ===
      canonicalRightHandSideDoc.marks.length;

    if (!isMarkLengthEqual) {
      return false;
    }

    for (let b = 0; b < canonicalLeftHandSideDoc.blocks.length; b++) {
      if (
        !JSONEquals(
          canonicalLeftHandSideDoc.blocks[b],
          canonicalRightHandSideDoc.blocks[b]
        )
      ) {
        return false;
      }
    }

    // in principle the order of marks shouldn't matter
    // however, since `serialize` sorts the marks, we can assume that
    // logically equivalent marks should be in the same place in the array
    // in identical documents
    for (let m = 0; m < canonicalLeftHandSideDoc.marks.length; m++) {
      if (
        !JSONEquals(
          canonicalLeftHandSideDoc.marks[m],
          canonicalRightHandSideDoc.marks[m]
        )
      ) {
        return false;
      }
    }

    return true;
  }

  withStableIds() {
    this.annotations.sort(compareAnnotations);

    let ids = new Map<string, string>();
    let counter = 1;
    for (let annotation of this.annotations) {
      let id = (counter++).toString(16);
      ids.set(annotation.id, "00000000".slice(id.length) + id);
    }

    this.annotations = this.annotations.map((annotation) =>
      annotation.withStableIds(ids)
    );

    return this;
  }

  private createAnnotation(
    annotation: Annotation<any> | AnnotationJSON
  ): Annotation<any> {
    let DocumentClass = this.constructor as typeof Document;
    let schema = [
      ...DocumentClass.schema,
      ParseAnnotation,
      SliceAnnotation,
      TextAnnotation,
    ];

    if (annotation instanceof UnknownAnnotation) {
      let KnownAnnotation = schema.find(function annotationMatchesClass(
        AnnotationClass
      ) {
        return (
          annotation.attributes.type ===
          `-${AnnotationClass.vendorPrefix}-${AnnotationClass.type}`
        );
      });

      if (KnownAnnotation) {
        return KnownAnnotation.hydrate(annotation.toJSON());
      }
      return annotation;
    } else if (annotation instanceof Annotation) {
      let AnnotationClass = annotation.getAnnotationConstructor();
      if (schema.indexOf(AnnotationClass) === -1) {
        let json = annotation.toJSON();
        return new UnknownAnnotation({
          id: json.id,
          start: json.start,
          end: json.end,
          attributes: {
            type: json.type,
            attributes: json.attributes,
          },
        });
      }
      return annotation;
    } else {
      let ConcreteAnnotation = schema.find(function annotationMatchesClass(
        AnnotationClass
      ) {
        return (
          annotation.type ===
          `-${AnnotationClass.vendorPrefix}-${AnnotationClass.type}`
        );
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
            attributes: annotation.attributes as any,
          },
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
    let notifyListeners = () => {
      for (let listener of this.changeListeners) {
        listener();
      }
      delete this.pendingChangeEvent;
    };
    this.pendingChangeEvent = setTimeout(notifyListeners, 0);
  }
}
