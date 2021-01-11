import { BlockAnnotation } from "@atjson/document";

export class Blockquote extends BlockAnnotation<{
  inset?: "left" | "right";
  /**
   * A named identifier used to quickly jump to this item
   */
  anchorName?: string;
}> {
  static type = "blockquote";
  static vendorPrefix = "offset";
}
