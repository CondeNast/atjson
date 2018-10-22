import { InlineAnnotation } from '@atjson/document';

export default class Strong extends InlineAnnotation {
  static type = 'strong';
  static vendorPrefix = 'commonmark';
}
