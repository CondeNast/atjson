import { BlockAnnotation } from "@atjson/document";

export default class List extends BlockAnnotation {
  static vendorPrefix = "gdocs";
  static type = "list";
  attributes!: {
    ls_id: string;
    ls_b_gs: string;
    ls_b_gt: number;
    ls_b_a: number;
  };
}
