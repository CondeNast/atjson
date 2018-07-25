import { InlineAnnotation } from '@atjson/document';

export default class Strong extends InlineAnnotation {
  static vendorPrefix = 'html';
  static type = 'strong';
}
