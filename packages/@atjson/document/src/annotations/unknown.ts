import { Annotation, clone, JSONObject } from "../internals";

export class UnknownAnnotation extends Annotation<{
  type: string;
  attributes: JSONObject;
}> {
  static vendorPrefix = "atjson";
  static type = "unknown";

  get rank() {
    return Number.MAX_SAFE_INTEGER;
  }

  toJSON() {
    return {
      id: this.id,
      start: this.start,
      end: this.end,
      type: this.attributes.type,
      attributes: clone(this.attributes.attributes),
    };
  }
}
