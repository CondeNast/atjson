import { InlineAnnotation } from "@atjson/document";

export default class Bold extends InlineAnnotation {
  static vendorPrefix = "gdocs";
  static type = "ts_bd"; // Text style: bold
}
