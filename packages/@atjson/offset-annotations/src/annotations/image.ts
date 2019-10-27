import { ObjectAnnotation } from "@atjson/document";

export class Image extends ObjectAnnotation<{
  url: string;
  title?: string;
  description?: string;
}> {
  static vendorPrefix = "offset";
  static type = "image";
}
