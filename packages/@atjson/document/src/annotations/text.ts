import { BlockAnnotation } from "./block";

/**
 * Text annotations are used to chunk text that
 * may have jagged edges or should have some
 * chunking that would otherwise collapse text
 * into run-on text.
 */
export class TextAnnotation extends BlockAnnotation<{}> {
  static vendorPrefix = "atjson";
  static type = "text";
}
