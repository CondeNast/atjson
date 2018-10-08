import { InlineAnnotation } from '@atjson/document';

export default class Blockquote extends InlineAnnotation {
  static type = 'blockquote';
  static vendorPrefix = 'offset';
  attributes!: {
    attribution: string;
    accreditation: string;
  };
}
