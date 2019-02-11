import { InlineAnnotation } from '@atjson/document';

export default class Strikethrough extends InlineAnnotation {
  static type = 'Strikethrough';
  static vendorPrefix = 'offset';
}
