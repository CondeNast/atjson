import { ObjectAnnotation } from '@atjson/document';

export function without<T>(array: T[], value: T): T[] {
  let result: T[] = [];
  return array.reduce((presentParts, part) => {
    if (part !== value) {
      presentParts.push(part);
    }
    return presentParts;
  }, result);
}

export default class IframeEmbed extends ObjectAnnotation {
  static type = 'IframeEmbed';
  static vendorPrefix = 'offset';
  attributes!: {
    url: string;
    width?: string;
    height?: string;
  };

  get url() {
    try {
      return new URL(this.attributes.url);
    } catch (e) {
      return null;
    }
  }
}
