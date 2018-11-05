import { ObjectAnnotation } from '@atjson/document';

export default class Atom extends ObjectAnnotation {
  static vendorPrefix = 'mobiledoc';
  static type = 'atom';
}
