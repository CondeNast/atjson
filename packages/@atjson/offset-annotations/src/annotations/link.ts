import { InlineAnnotation } from "@atjson/document";

export default class Link extends InlineAnnotation<{
  url: string;
  title?: string;
  rel?: string;
  target?: string;
}> {
  static type = "link";
  static vendorPrefix = "offset";
}
