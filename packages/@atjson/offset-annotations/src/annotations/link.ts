import { InlineAnnotation } from "@atjson/document";

export class Link extends InlineAnnotation<{
  url: string;
  title?: string;
  rel?: string;
  target?: string;
}> {
  static type = "link";
  static vendorPrefix = "offset";
}
