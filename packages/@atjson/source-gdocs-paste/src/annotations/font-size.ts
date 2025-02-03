import { InlineAnnotation } from "@atjson/document";

export class FontSize extends InlineAnnotation<{ size: number }> {
  static vendorPrefix = "gdocs";
  static type = "ts_fs"; // Text style: font size
}
