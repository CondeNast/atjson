import { BlockAnnotation } from "@atjson/document";

export class Blockquote extends BlockAnnotation {
  static type = "blockquote";
  static vendorPrefix = "offset";
}
