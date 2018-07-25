import { InlineAnnotation } from '@atjson/document';

export default class Strikethrough extends InlineAnnotation {
  static vendorPrefix = 'html';
  static type = 's';
}
