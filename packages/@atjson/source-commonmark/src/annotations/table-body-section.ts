import { BlockAnnotation } from "@atjson/document";

export class TableBodySection extends BlockAnnotation {
  static type = "tbody";
  static vendorPrefix = "commonmark";
}
