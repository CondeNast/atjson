import { BlockAnnotation } from '../../../document/dist/commonjs';

export default class Blockquote extends BlockAnnotation {
  static vendorPrefix = 'html';
  static type = 'blockquote';
}
