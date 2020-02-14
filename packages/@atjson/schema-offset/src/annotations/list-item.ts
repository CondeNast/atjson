import { BlockAnnotation } from "@atjson/document";

export class ListItem extends BlockAnnotation {
  static vendorPrefix = "offset";
  static type = "list-item";
}
