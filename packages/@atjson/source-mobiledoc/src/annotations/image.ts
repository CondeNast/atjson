import { ObjectAnnotation } from "@atjson/document";

export class Image extends ObjectAnnotation<{
  src: string;
}> {
  static vendorPrefix = "mobiledoc";
  static type = "img";
}
