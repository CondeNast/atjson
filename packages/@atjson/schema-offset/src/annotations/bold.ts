import { InlineAnnotation } from "@atjson/document";

export class Bold extends InlineAnnotation {
  static type = "bold";
  static vendorPrefix = "offset";
}
