import { InlineAnnotation } from '../../../document/dist/commonjs';

export default class Superscript extends InlineAnnotation {
  static vendorPrefix = 'html';
  static type = 'sup';
}
