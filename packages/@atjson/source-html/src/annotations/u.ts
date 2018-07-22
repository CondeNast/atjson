import { InlineAnnotation } from '@atjson/document';

export default class Underline extends InlineAnnotation {
  static vendorPrefix = 'html';
  static type = 'u';
}
