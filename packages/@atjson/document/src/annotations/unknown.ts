import Annotation from "../annotation";
import { clone } from "../attributes";
import JSON from "../json";

/**
 * Unknown annotations is what all the annotations not in your
 * schema are cast to. In JSON, they look like a normal annotation,
 * but this provides a neat way to track and ignore these
 * annotations in bulk.
 */
export default class UnknownAnnotation extends Annotation<{
  type: string;
  attributes: JSON;
}> {
  static vendorPrefix = "atjson";
  static type = "unknown";

  static hydrate(attrs: {
    id?: string;
    type: string;
    start: number;
    end: number;
    attributes: JSON;
  }) {
    return new UnknownAnnotation({
      id: attrs.id,
      start: attrs.start,
      end: attrs.end,
      attributes: {
        type: attrs.type,
        attributes: attrs.attributes
      }
    });
  }

  // Expected behavior is unknown, but
  // this provides the fewest side-effects
  get rank() {
    return Number.MAX_SAFE_INTEGER;
  }

  toJSON() {
    return {
      id: this.id,
      start: this.start,
      end: this.end,
      type: this.attributes.type,
      attributes: clone(this.attributes.attributes)
    };
  }
}
