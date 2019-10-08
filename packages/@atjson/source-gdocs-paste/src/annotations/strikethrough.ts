import { InlineAnnotation } from "@atjson/document";

export class Strikethrough extends InlineAnnotation {
  static vendorPrefix = "gdocs";
  /**
   * Text style: strikethrough
   */
  static type = "ts_st" as const;
}
