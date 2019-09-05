import { InlineAnnotation } from "@atjson/document";

export default class Emphasis extends InlineAnnotation {
  static type = "em";
  static vendorPrefix = "commonmark";
}
