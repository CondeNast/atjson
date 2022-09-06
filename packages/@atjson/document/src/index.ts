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
  SliceAnnotation,
  UnknownAnnotation,
  is,
  serialize,
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
  SliceAnnotation,
  UnknownAnnotation,
  is,
  serialize,
};

export type { AnnotationConstructor, AnnotationJSON, AttributesOf, JSON };

export default Document;
