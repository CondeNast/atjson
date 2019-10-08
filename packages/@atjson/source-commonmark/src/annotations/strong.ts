import { InlineAnnotation } from "@atjson/document";

export class Strong extends InlineAnnotation {
  static type = "strong";
  static vendorPrefix = "commonmark";
}
