import { BlockAnnotation } from "@atjson/document";

export class GroupItem<T = {}> extends BlockAnnotation<
  T & {
    /**
     * A named identifier used to quickly jump to this item
     */
    anchorName?: string;
  }
> {
  static type = "group-item";
  static vendorPrefix = "offset";
}
