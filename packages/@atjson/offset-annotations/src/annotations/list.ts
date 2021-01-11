import { BlockAnnotation } from "@atjson/document";

export class List extends BlockAnnotation<{
  type: string;
  delimiter?: string;
  loose?: boolean;
  level?: number;
  startsAt?: number;
  /**
   * A named identifier used to quickly jump to this item
   */
  anchorName?: string;
}> {
  static vendorPrefix = "offset";
  static type = "list";
}
