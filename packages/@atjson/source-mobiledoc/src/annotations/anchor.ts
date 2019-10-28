import { InlineAnnotation } from "@atjson/document";

export default class Anchor extends InlineAnnotation<{
  href: string;
  target?: string;
  rel?: string;
}> {
  static vendorPrefix = "mobiledoc";
  static type = "a";
}
