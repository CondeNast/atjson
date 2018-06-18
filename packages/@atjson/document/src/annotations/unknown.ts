import Annotation from '../annotation';
import { Attributes } from '../attributes';

export default class UnknownAnnotation extends Annotation {
  static vendorPrefix = 'atjson';
  static type = 'unknown';
  attributes: {
    type: string;
    attributes: Attributes;
  };

  get rank() {
    return Number.MAX_SAFE_INTEGER;
  }

  toJSON() {
    return {
      start: this.start,
      end: this.end,
      type: this.attributes.type,
      attributes: this.attributes.attributes
    };
  }
}
