import { InlineAnnotation } from '@atjson/document';

export default class Superscript extends InlineAnnotation {
  static vendorPrefix = 'mobiledoc';
  static type = 'sup';
}
