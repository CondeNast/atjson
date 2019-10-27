import { BlockAnnotation } from "@atjson/document";

export class ListItem extends BlockAnnotation {
  static vendorPrefix = "mobiledoc";
  static type = "li";
}
