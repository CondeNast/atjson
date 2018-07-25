import { InlineAnnotation } from '../../../document/dist/commonjs';

export default class PreformattedText extends InlineAnnotation {
  static vendorPrefix = 'html';
  static type = 'pre';
}
