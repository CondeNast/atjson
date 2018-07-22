import { InlineAnnotation } from '@atjson/document';

export default class DeletedText extends InlineAnnotation {
  static vendorPrefix = 'html';
  static type = 'del';
}
