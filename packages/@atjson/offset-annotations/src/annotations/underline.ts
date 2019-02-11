import { InlineAnnotation } from '@atjson/document';

export default class Underline extends InlineAnnotation {
  static type = 'Underline';
  static vendorPrefix = 'offset';
}
