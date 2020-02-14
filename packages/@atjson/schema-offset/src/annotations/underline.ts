import { InlineAnnotation } from "@atjson/document";

export class Underline extends InlineAnnotation {
  static type = "underline";
  static vendorPrefix = "offset";
}
