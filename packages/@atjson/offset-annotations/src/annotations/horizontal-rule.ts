import { BlockAnnotation } from "@atjson/document";

export class HorizontalRule extends BlockAnnotation<{
  /**
   * Indicates a stylistic alternate for a horizontal
   * rule, which can be used to divide content for
   * special reports or stories.
   */
  style?: string;
}> {
  static vendorPrefix = "offset";
  static type = "horizontal-rule";
}
