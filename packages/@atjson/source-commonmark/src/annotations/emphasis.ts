import { InlineAnnotation } from "@atjson/document";

export class Emphasis extends InlineAnnotation {
  static type = "em";
  static vendorPrefix = "commonmark";
}
