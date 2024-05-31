import { BlockAnnotation } from "@atjson/document";

export class Pullquote extends BlockAnnotation<{
  /**
   * Layout information, used to indicate mutually
   * exclusive layouts, for example sizes, floats, etc.
   */
  layout?: string;

  /**
   * A named identifier used to quickly jump to this item
   */
  anchorName?: string;
}> {
  static type = "pullquote";
  static vendorPrefix = "offset";
}
