import { ObjectAnnotation } from '@atjson/document';

export default class Image extends ObjectAnnotation {
  static vendorPrefix = 'mobiledoc';
  static type = 'img';
  attributes!: {
    src: string;
  };
}
