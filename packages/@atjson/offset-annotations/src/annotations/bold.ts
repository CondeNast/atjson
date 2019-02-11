import { InlineAnnotation } from '@atjson/document';

export default class Bold extends InlineAnnotation {
  static type = 'Bold';
  static vendorPrefix = 'offset';
}
