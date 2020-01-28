import { BlockAnnotation } from "@atjson/document";

export class Paragraph extends BlockAnnotation {
  static vendorPrefix = "commonmark";
  static type = "paragraph";

  get rank() {
    return 15;
  }
}
