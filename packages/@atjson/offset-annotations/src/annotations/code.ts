import { Annotation } from '@atjson/document';

export default class Code extends Annotation<{
  style: 'block' | 'inline' | 'fence';
  info?: string;
}> {
  static vendorPrefix = 'offset';
  static type = 'code';

  get rank() {
    if (this.attributes.style === 'inline') {
      return 100;
    }
    return 10;
  }
}
