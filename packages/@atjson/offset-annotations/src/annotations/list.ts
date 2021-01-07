import { BlockAnnotation } from "@atjson/document";

export class List extends BlockAnnotation<{
  type: string;
  delimiter?: string;
  loose?: boolean;
  level?: number;
  startsAt?: number;
}> {
  static vendorPrefix = "offset";
  static type = "list";
}
