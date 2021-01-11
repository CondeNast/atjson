import { ObjectAnnotation } from "@atjson/document";

export class Image extends ObjectAnnotation<{
  url: string;
  title?: string;
  description?: string;
  /**
   * A named identifier used to quickly jump to this item
   */
  anchorName?: string;
}> {
  static vendorPrefix = "offset";
  static type = "image";
}
