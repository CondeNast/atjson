import { Annotation } from "../internals";

/**
 * Slices are used to reference ranges of text,
 * which other annotations can use to reference
 * that text by id.
 *
 * A list of annotation ids that use this slice
 * is convenient when making decisions about
 * whether the slice is used.
 */
export class SliceAnnotation extends Annotation<{
  refs: string[];
}> {
  static vendorPrefix = "atjson";
  static type = "slice";

  get rank() {
    return 10000;
  }
}
