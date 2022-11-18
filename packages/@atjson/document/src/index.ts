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
  deserialize,
  serialize,
} from "./internals";

import type {
  AnnotationConstructor,
  AnnotationJSON,
  AttributesOf,
  JSON,
  Mark,
  Block,
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
  deserialize,
  serialize,
};

export type {
  AnnotationConstructor,
  AnnotationJSON,
  AttributesOf,
  JSON,
  Mark,
  Block,
};

export default Document;
