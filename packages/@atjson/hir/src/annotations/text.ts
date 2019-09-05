import { Annotation } from "@atjson/document";

export default class TextAnnotation extends Annotation {
  static vendorPrefix = "atjson";
  static type = "text";
  attributes!: {
    text: string;
  };

  get rank() {
    return Infinity;
  }
}
