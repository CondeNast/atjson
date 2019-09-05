import { BlockAnnotation } from "@atjson/document";

export default class Blockquote extends BlockAnnotation {
  static type = "blockquote";
  static vendorPrefix = "commonmark";
}
