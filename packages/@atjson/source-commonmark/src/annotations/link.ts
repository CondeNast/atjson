import { InlineAnnotation } from "@atjson/document";

export default class Link extends InlineAnnotation<{
  href: string;
  title?: string;
}> {
  static type = "link";
  static vendorPrefix = "commonmark";
}
