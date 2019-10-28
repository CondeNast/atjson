import { BlockAnnotation } from "@atjson/document";

export default class ListItem extends BlockAnnotation<{
  ls_id: string;
  ls_nest: number;
}> {
  static vendorPrefix = "gdocs";
  static type = "list_item";
}
