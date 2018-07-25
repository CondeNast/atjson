import { InlineAnnotation } from '../../../document/dist/commonjs';

export default class Code extends InlineAnnotation {
  static vendorPrefix = 'html';
  static type = 'code';
}
