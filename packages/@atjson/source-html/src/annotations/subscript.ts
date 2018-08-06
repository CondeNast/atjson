import { InlineAnnotation } from '@atjson/document';

export default class Subscript extends InlineAnnotation {
  static vendorPrefix = 'html';
  static type = 'sub';
}
