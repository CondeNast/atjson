import { BlockAnnotation } from "@atjson/document";

export class TableRow extends BlockAnnotation {
  static type = "tr";
  static vendorPrefix = "commonmark";
}
