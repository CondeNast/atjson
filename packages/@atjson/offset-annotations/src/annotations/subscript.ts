import { InlineAnnotation } from '@atjson/document';

export default class Subscript extends InlineAnnotation {
  static type = 'Subscript';
  static vendorPrefix = 'offset';
}
