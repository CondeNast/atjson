import { InlineAnnotation } from '@atjson/document';

export default class Bold extends InlineAnnotation {
  static vendorPrefix = 'html';
  static type = 'b';
}
