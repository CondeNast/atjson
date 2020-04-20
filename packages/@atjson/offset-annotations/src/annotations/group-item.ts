import { BlockAnnotation } from "@atjson/document";

export class GroupItem<T = {}> extends BlockAnnotation<T> {
  static type = "group-item";
  static vendorPrefix = "offset";
}
