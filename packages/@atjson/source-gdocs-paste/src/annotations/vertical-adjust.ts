import { InlineAnnotation } from '@atjson/document';

export default class VerticalAdjust extends InlineAnnotation {
  static vendorPrefix = 'gdocs';
  static type = 'ts_va'; // Text style: underline
  attributes!: {
    va: 'sub' | 'sup'; // Vertical adjust: subscript / superscript
  };
}
