import { BlockAnnotation } from '@atjson/document';

export default class Blockquote extends BlockAnnotation {
  static vendorPrefix = 'html';
  static type = 'blockquote';
}
