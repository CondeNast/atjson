import { BlockAnnotation } from '@atjson/document';

export default class Blockquote extends BlockAnnotation {
  static type = 'blockquote';
  static vendorPrefix = 'offset';
  attributes!: {
    attribution: string;
    accreditation: string;
  };
}
