import { InlineAnnotation } from "@atjson/document";

export default class Bold extends InlineAnnotation {
  static vendorPrefix = "mobiledoc";
  static type = "b";
}
