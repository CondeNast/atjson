import { BlockAnnotation } from "@atjson/document";

export class Alignment extends BlockAnnotation<{
  // Text alignment: left / center / right / justify
  align: 0 | 1 | 2 | 3;
}> {
  static vendorPrefix = "gdocs";
  static type = "ps_al"; // Text style: vertical adjust
}
