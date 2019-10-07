import { InlineAnnotation } from "@atjson/document";

export class Strikethrough extends InlineAnnotation {
  static type = "strikethrough";
  static vendorPrefix = "offset";
}
