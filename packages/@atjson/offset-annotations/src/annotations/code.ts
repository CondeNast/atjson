import { InlineAnnotation } from "@atjson/document";

export class Code extends InlineAnnotation {
  static vendorPrefix = "offset";
  static type = "code";
}
