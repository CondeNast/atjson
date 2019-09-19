import { InlineAnnotation } from "@atjson/document";

export default class Link extends InlineAnnotation {
  static type = "link";
  static vendorPrefix = "commonmark";
  attributes!: {
    href: string;
    title?: string;
  };
}
