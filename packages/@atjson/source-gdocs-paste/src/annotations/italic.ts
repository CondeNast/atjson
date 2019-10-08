import { InlineAnnotation } from "@atjson/document";

export class Italic extends InlineAnnotation {
  static vendorPrefix = "gdocs";
  /**
   * Text style: italic
   */
  static type = "ts_it" as const;
}
