import { InlineAnnotation } from '../../../document/dist/commonjs';

export default class Emphasis extends InlineAnnotation {
  static vendorPrefix = 'html';
  static type = 'em';
}
