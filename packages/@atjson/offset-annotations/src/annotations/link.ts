import { InlineAnnotation } from "@atjson/document";

export class Link extends InlineAnnotation<{
  url: string;
  title?: string;
}> {
  static type = "link";
  static vendorPrefix = "offset";
}
