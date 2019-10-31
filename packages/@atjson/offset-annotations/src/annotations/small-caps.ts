import { InlineAnnotation } from "@atjson/document";

export default class SmallCaps extends InlineAnnotation {
  static vendorPrefix = "offset";
  static type = "small-caps";
}
