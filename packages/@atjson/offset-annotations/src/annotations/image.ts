import { ObjectAnnotation } from '@atjson/document';

export default class Image extends ObjectAnnotation {
  static vendorPrefix = 'offset';
  static type = 'image';
  attributes!: {
    url: string;
    title: string;
    description: string;
  };
}
