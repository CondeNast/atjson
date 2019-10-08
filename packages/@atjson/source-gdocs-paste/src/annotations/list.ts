import { BlockAnnotation } from "@atjson/document";

export class List extends BlockAnnotation<{
  ls_id: string;
  ls_b_gs: string;
  ls_b_gt: number;
  ls_b_a: number;
}> {
  static vendorPrefix = "gdocs";
  static type = "list";
}
