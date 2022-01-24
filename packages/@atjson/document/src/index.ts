import {
  AdjacentBoundaryBehaviour,
  Annotation,
  AnnotationCollection,
  BlockAnnotation,
  Change,
  compareAnnotations,
  Deletion,
  Document,
  EdgeBehaviour,
  getConverterFor,
  InlineAnnotation,
  Insertion,
  Join,
  ObjectAnnotation,
  ParseAnnotation,
  UnknownAnnotation,
  is,
} from "./internals";

import type {
  AnnotationConstructor,
  AnnotationJSON,
  AttributesOf,
  JSON,
} from "./internals";

export {
  AdjacentBoundaryBehaviour,
  Annotation,
  AnnotationCollection,
  BlockAnnotation,
  Change,
  compareAnnotations,
  Deletion,
  EdgeBehaviour,
  getConverterFor,
  InlineAnnotation,
  Insertion,
  Join,
  ObjectAnnotation,
  ParseAnnotation,
  UnknownAnnotation,
  is,
};

export type { AnnotationConstructor, AnnotationJSON, AttributesOf, JSON };

export default Document;
