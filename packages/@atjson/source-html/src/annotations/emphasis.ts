import { InlineAnnotation } from '@atjson/document';

export default class Emphasis extends InlineAnnotation {
  static vendorPrefix = 'html';
  static type = 'em';
}
