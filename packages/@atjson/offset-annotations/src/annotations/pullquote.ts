import { BlockAnnotation } from '@atjson/document';

export default class Pullquote extends BlockAnnotation {
  static type = 'Pullquote';
  static vendorPrefix = 'offset';
}
