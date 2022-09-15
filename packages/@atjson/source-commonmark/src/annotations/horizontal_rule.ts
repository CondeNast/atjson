import { BlockAnnotation } from "@atjson/document";

export class HorizontalRule extends BlockAnnotation {
  static type = "hr";
  static vendorPrefix = "commonmark";
}
