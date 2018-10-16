import { BlockAnnotation } from '@atjson/document';

export default class CodeBlock extends BlockAnnotation {
  static type = 'code_block';
  static vendorPrefix = 'commonmark';
}
