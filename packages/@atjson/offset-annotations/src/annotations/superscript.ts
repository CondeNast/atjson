import { InlineAnnotation } from "@atjson/document";

export class Superscript extends InlineAnnotation {
  static type = "superscript";
  static vendorPrefix = "offset";
}
