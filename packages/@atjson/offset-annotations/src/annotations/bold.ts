import { InlineAnnotation } from "@atjson/document";

export default class Bold extends InlineAnnotation {
  static type = "bold";
  static vendorPrefix = "offset";
}
