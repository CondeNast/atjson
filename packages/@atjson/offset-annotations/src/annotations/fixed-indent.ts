import { InlineAnnotation } from "@atjson/document";

export class FixedIndent extends InlineAnnotation {
  static type = "fixed-indent";
  static vendorPrefix = "offset";
}
