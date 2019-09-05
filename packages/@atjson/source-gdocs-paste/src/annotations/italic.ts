import { InlineAnnotation } from "@atjson/document";

export default class Italic extends InlineAnnotation {
  static vendorPrefix = "gdocs";
  static type = "ts_it"; // Text style: italic
}
