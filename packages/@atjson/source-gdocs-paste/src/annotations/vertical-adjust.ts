import { InlineAnnotation } from "@atjson/document";

export class VerticalAdjust extends InlineAnnotation<{
  /**
   * Vertical adjust: subscript / superscript
   */
  va: "sub" | "sup";
}> {
  static vendorPrefix = "gdocs";
  /**
   * Text style: vertical adjust
   */
  static type = "ts_va" as const;
}
