import { InlineAnnotation } from '@atjson/document';

export default class PreformattedText extends InlineAnnotation {
  static vendorPrefix = 'html';
  static type = 'pre';
}
