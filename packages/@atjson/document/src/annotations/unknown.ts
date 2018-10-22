import Annotation from '../annotation';
import JSON from '../json';

export default class UnknownAnnotation extends Annotation {
  static vendorPrefix = 'atjson';
  static type = 'unknown';
  attributes!: {
    type: string;
    attributes: JSON;
  };

  get rank() {
    return Number.MAX_SAFE_INTEGER;
  }

  toJSON() {
    return {
      id: this.id,
      start: this.start,
      end: this.end,
      type: this.attributes.type,
      attributes: this.attributes.attributes
    };
  }
}
