import Annotation, { SerializedAnnotation } from "./annotation";
import {
  BlockAnnotation,
  InlineAnnotation,
  ObjectAnnotation,
  ParseAnnotation,
  UnknownAnnotation
} from "./annotations";
import Change, {
  AdjacentBoundaryBehaviour,
  Deletion,
  Insertion
} from "./change";
import Collection from "./collection";
import Document, { getConverterFor } from "./document";
import Join from "./join";
import JSON from "./json";
import { SchemaDefinition } from "./schema";

/**
 * AttributesOf returns the type definition of an annotation's attributes.
 */
type AttributesOf<AnnotationClass> = AnnotationClass extends Annotation<
  infer Attributes
>
  ? Attributes
  : never;

export default Document;

export {
  AdjacentBoundaryBehaviour,
  Annotation,
  AttributesOf,
  BlockAnnotation,
  Change,
  Collection,
  Deletion,
  InlineAnnotation,
  Insertion,
  JSON,
  ObjectAnnotation,
  Join,
  ParseAnnotation,
  SchemaDefinition,
  SerializedAnnotation,
  UnknownAnnotation,
  getConverterFor
};
