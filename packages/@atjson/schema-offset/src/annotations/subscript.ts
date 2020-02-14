import { InlineAnnotation } from "@atjson/document";

export class Subscript extends InlineAnnotation {
  static type = "subscript";
  static vendorPrefix = "offset";
}
