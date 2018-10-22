import { ObjectAnnotation } from '@atjson/document';

export default class Image extends ObjectAnnotation {
  static type = 'image';
  static vendorPrefix = 'commonmark';
  attributes!: {
    alt: string;
    src: string;
    title: string;
  };
}
