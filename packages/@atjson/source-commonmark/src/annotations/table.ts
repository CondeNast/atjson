import { BlockAnnotation } from "@atjson/document";

export class Table extends BlockAnnotation {
  static type = "table";
  static vendorPrefix = "commonmark";
}
