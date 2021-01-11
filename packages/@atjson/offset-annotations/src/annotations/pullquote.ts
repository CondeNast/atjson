import { BlockAnnotation } from "@atjson/document";

export class Pullquote extends BlockAnnotation<{
  /**
   * A named identifier used to quickly jump to this item
   */
  anchorName?: string;
}> {
  static type = "pullquote";
  static vendorPrefix = "offset";
}
