import { BlockAnnotation } from '@atjson/document';

export default class Head extends BlockAnnotation {
  static vendorPrefix = 'html';
  static type = 'head';
}
