import { InlineAnnotation } from "@atjson/document";

export default class Subscript extends InlineAnnotation {
  static type = "subscript";
  static vendorPrefix = "offset";
}
