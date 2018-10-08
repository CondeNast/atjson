import { Annotation } from '@atjson/document';

export default class Code extends Annotation {
  static vendorPrefix = 'offset';
  static type = 'code';
  attributes!: {
    style: 'fence' | 'inline' | 'fence';
    language: string;
  };

  get rank() {
    if (this.attributes.style === 'inline') {
      return 100;
    }
    return 10;
  }
}
