import { ObjectAnnotation } from "@atjson/document";

export class CerosEmbed extends ObjectAnnotation<{
  url: string;
  aspectRatio: number;
  mobileAspectRatio?: number;
}> {
  static vendorPrefix = "offset";
  static type = "ceros-embed";
}
