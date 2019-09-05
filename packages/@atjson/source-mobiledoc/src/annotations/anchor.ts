import { InlineAnnotation } from "@atjson/document";

export default class Anchor extends InlineAnnotation {
  static vendorPrefix = "mobiledoc";
  static type = "a";
  attributes!: {
    href: string;
    target: string;
    rel: string;
  };
}
