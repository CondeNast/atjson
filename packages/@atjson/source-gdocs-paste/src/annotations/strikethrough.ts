import { InlineAnnotation } from '@atjson/document';

export default class Strikethrough extends InlineAnnotation {
  static vendorPrefix = 'gdocs';
  static type = 'ts_st'; // Text style: strikethrough
}
