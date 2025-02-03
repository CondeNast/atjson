import { BlockAnnotation } from "@atjson/document";

export class IndentLeft extends BlockAnnotation<{ indent: number }> {
  static vendorPrefix = "gdocs";
  static type = "ps_il";
}
