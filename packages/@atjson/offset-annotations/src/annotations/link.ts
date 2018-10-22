import { InlineAnnotation } from '@atjson/document';

export default class Link extends InlineAnnotation {
  static type = 'link';
  static vendorPrefix = 'offset';
  attributes!: {
    url: string;
    title: string;
  };
}
