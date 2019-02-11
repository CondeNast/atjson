import { InlineAnnotation } from '@atjson/document';

export default class Italic extends InlineAnnotation {
  static type = 'Italic';
  static vendorPrefix = 'offset';
}
