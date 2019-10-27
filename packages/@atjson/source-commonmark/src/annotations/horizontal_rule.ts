import { ObjectAnnotation } from "@atjson/document";

export class HorizontalRule extends ObjectAnnotation {
  static type = "hr";
  static vendorPrefix = "commonmark";
}
