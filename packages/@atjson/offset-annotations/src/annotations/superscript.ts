import { InlineAnnotation } from '@atjson/document';

export default class Superscript extends InlineAnnotation {
  static type = 'Superscript';
  static vendorPrefix = 'offset';
}
