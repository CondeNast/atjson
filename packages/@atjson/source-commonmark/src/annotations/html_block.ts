import { BlockAnnotation } from '@atjson/document';

export default class BlockHTML extends BlockAnnotation {
  static vendorPrefix = 'commonmark';
  static type = 'html_block';
}
