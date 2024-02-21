import { BlockAnnotation } from "@atjson/document";

export class TableHeadSection extends BlockAnnotation {
  static type = "thead";
  static vendorPrefix = "commonmark";
}
