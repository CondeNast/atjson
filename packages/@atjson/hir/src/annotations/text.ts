import { Annotation } from "@atjson/document";

export default class TextAnnotation extends Annotation<{
  text: string;
}> {
  static vendorPrefix = "atjson";
  static type = "text";

  get rank() {
    return Infinity;
  }
}
