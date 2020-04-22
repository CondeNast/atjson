import { InlineAnnotation } from "@atjson/document";

export class Shortcode extends InlineAnnotation<{
  tag: string;
  type: "single" | "self-closing" | "closed";
  attrs: {
    named: object;
    numeric: any[];
  };
}> {
  static vendorPrefix = "wordpress";
  static type = "shortcode";
}
