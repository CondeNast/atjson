import { BlockAnnotation } from "@atjson/document";

export class Blockquote extends BlockAnnotation<{
  inset?: "left" | "right";
}> {
  static type = "blockquote";
  static vendorPrefix = "offset";
}
