import { BlockAnnotation } from '@atjson/document';

export default class HTML extends BlockAnnotation {
  static vendorPrefix = 'commonmark';
  static type = 'html';
}
