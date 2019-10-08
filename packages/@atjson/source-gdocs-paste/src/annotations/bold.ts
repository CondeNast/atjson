import { InlineAnnotation } from "@atjson/document";

export class Bold extends InlineAnnotation {
  static vendorPrefix = "gdocs";
  /**
   * Text style: bold
   */
  static type = "ts_bd" as const;
}
