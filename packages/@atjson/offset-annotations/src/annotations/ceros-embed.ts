import { ObjectAnnotation } from "@atjson/document";

export class CerosEmbed extends ObjectAnnotation<{
  url: string;
  aspectRatio: number;
  mobileAspectRatio?: number;
  size: "small" | "medium" | "large";
  /**
   * A named identifier used to quickly jump to this item
   */
  anchorName?: string;
}> {
  static vendorPrefix = "offset";
  static type = "ceros-embed";
}
