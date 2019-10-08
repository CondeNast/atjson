import { InlineAnnotation } from "@atjson/document";

export class Underline extends InlineAnnotation {
  static vendorPrefix = "gdocs";
  /**
   * Text style: underline
   */
  static type = "ts_un" as const;
}
