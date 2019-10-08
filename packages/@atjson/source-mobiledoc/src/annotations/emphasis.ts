import { InlineAnnotation } from "@atjson/document";

export class Emphasis extends InlineAnnotation {
  static vendorPrefix = "mobiledoc";
  static type = "em";
}
