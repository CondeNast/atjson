import { InlineAnnotation } from "@atjson/document";

export class Bold extends InlineAnnotation {
  static vendorPrefix = "gdocs";
  static type = "ts_bd"; // Text style: bold
}
