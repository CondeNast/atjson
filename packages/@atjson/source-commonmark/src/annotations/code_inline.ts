import { InlineAnnotation } from '@atjson/document';

export default class CodeInline extends InlineAnnotation {
  static type = 'code_inline';
  static vendorPrefix = 'commonmark';
}
