import { InlineAnnotation } from "@atjson/document";

export default class Underline extends InlineAnnotation {
  static vendorPrefix = "gdocs";
  static type = "ts_un"; // Text style: underline
}
