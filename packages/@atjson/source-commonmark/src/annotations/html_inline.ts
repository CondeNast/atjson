import { InlineAnnotation } from "@atjson/document";

export class InlineHTML extends InlineAnnotation {
  static vendorPrefix = "commonmark";
  static type = "html_inline";
}
