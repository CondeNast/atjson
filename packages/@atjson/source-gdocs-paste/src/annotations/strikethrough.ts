import { InlineAnnotation } from "@atjson/document";

export class Strikethrough extends InlineAnnotation {
  static vendorPrefix = "gdocs";
  static type = "ts_st"; // Text style: strikethrough
}
