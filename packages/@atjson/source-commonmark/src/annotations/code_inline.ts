import { InlineAnnotation } from "@atjson/document";

export class CodeInline extends InlineAnnotation {
  static type = "code_inline";
  static vendorPrefix = "commonmark";
}
