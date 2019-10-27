import { InlineAnnotation } from "@atjson/document";

export class HTMLInline extends InlineAnnotation {
  static vendorPrefix = "commonmark";
  static type = "html_inline";
}
