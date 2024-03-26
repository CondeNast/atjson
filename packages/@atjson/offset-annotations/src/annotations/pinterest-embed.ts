import { BlockAnnotation } from "@atjson/document";

export class PinterestEmbed extends BlockAnnotation<{
  url: string;

  /**
   * Refers to a slice instead of being an
   * embedded document.
   */
  caption?: string;

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
  static type = "pinterest-embed";
  static vendorPrefix = "offset";
}
