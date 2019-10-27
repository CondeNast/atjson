import { InlineAnnotation } from "@atjson/document";

export class Code extends InlineAnnotation {
  static vendorPrefix = "mobiledoc";
  static type = "code";
}
