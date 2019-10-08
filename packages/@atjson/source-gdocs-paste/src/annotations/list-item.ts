import { BlockAnnotation } from "@atjson/document";

export class ListItem extends BlockAnnotation<{
  ls_id: string;
  ls_nest: number;
}> {
  static vendorPrefix = "gdocs";
  static type = "list_item";
}
