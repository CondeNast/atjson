import { BlockAnnotation } from "@atjson/document";

export class Heading extends BlockAnnotation<{
  level: 1 | 2 | 3 | 4 | 5 | 6;
  alignment?: "start" | "center" | "end" | "justify";
  /**
   * A named identifier used to quickly jump to this item
   */
  anchorName?: string;
}> {
  static type = "heading";
  static vendorPrefix = "offset";
}
