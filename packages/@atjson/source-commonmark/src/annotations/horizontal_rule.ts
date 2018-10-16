import { ObjectAnnotation } from '@atjson/document';

export default class HorizontalRule extends ObjectAnnotation {
  static type = 'hr';
  static vendorPrefix = 'commonmark';
}
