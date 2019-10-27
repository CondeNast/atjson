import { BlockAnnotation } from "@atjson/document";

export class Blockquote extends BlockAnnotation<{
  inset?: string;
}> {
  static type = "blockquote";
  static vendorPrefix = "offset";
}
