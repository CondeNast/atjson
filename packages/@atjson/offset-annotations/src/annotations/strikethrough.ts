import { InlineAnnotation } from "@atjson/document";

export default class Strikethrough extends InlineAnnotation {
  static type = "strikethrough";
  static vendorPrefix = "offset";
}
