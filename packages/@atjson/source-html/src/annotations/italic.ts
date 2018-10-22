import { InlineAnnotation } from '@atjson/document';

export default class Italic extends InlineAnnotation {
  static vendorPrefix = 'html';
  static type = 'i';
}
