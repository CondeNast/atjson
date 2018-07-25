import { InlineAnnotation } from '@atjson/document';

export default class Code extends InlineAnnotation {
  static vendorPrefix = 'html';
  static type = 'code';
}
