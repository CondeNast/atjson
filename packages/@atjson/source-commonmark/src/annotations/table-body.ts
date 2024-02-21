import { BlockAnnotation } from "@atjson/document";

export class TableBody extends BlockAnnotation {
  static type = "tbody";
  static vendorPrefix = "commonmark";
}
