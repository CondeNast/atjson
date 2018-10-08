import { InlineAnnotation } from '@atjson/document';

export default class Pullquote extends InlineAnnotation {
  static type = 'pullquote';
  static vendorPrefix = 'offset';
}
