import { InlineAnnotation } from "@atjson/document";

export default class Indent extends InlineAnnotation<{
  size: number;
}> {
  static type = "indent";
  static vendorPrefix = "offset";
}
