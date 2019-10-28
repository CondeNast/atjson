import { ObjectAnnotation } from "@atjson/document";

export default class Image extends ObjectAnnotation<{
  src: string;
}> {
  static vendorPrefix = "mobiledoc";
  static type = "img";
}
