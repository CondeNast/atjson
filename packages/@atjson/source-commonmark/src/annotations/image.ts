import { ObjectAnnotation } from "@atjson/document";

export default class Image extends ObjectAnnotation<{
  alt?: string;
  src: string;
  title?: string;
}> {
  static type = "image";
  static vendorPrefix = "commonmark";
}
