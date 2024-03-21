import { InlineAnnotation } from "@atjson/document";

export class SmallCaps extends InlineAnnotation {
  static vendorPrefix = "gdocs";
  static type = "ts_sc"; // Text style: small caps
}
