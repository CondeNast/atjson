import { BlockAnnotation } from "@atjson/document";

export class Group extends BlockAnnotation<{}> {
  static type = "group";
  static vendorPrefix = "offset";
}
