import { BlockAnnotation } from "@atjson/document";

export class GroupItem extends BlockAnnotation<{}> {
  static type = "group-item";
  static vendorPrefix = "offset";
}
