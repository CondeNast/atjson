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
  /**
   * Whether the range of the document should
   * be retained in rendering. If true, the
   * slice can be referred to and it will display
   * in situ in the document.
   *
   * This is useful for cases like progressive
   * enhancement of documents, where navigation
   * is created dynamically from items in the document,
   * and elements from the page are used for navigation
   * purposes.
   */
  retain?: boolean;
}> {
  static vendorPrefix = "atjson";
  static type = "slice";

  get rank() {
    return 5;
  }
}
