import { InlineAnnotation } from "@atjson/document";

export class Italic extends InlineAnnotation {
  static type = "italic";
  static vendorPrefix = "offset";
}
