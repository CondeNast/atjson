import { InlineAnnotation } from '../../../document/dist/commonjs';

export default class DeletedText extends InlineAnnotation {
  static vendorPrefix = 'html';
  static type = 'del';
}
