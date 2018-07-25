import { InlineAnnotation } from '@atjson/document';

export default class Superscript extends InlineAnnotation {
  static vendorPrefix = 'html';
  static type = 'sup';
}
