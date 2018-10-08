import { Annotation } from '@atjson/document';

export default class HTML extends Annotation {
  static vendorPrefix = 'offset';
  static type = 'html';
  attributes!: {
    style: 'inline' | 'block';
  };

  get rank() {
    if (this.attributes.style === 'inline') {
      return 100;
    }
    return 10;
  }
}
