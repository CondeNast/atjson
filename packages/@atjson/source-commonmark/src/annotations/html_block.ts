import { BlockAnnotation } from "@atjson/document";

export class HTMLBlock extends BlockAnnotation {
  static vendorPrefix = "commonmark";
  static type = "html_block";
}
