import { BlockAnnotation } from "@atjson/document";

export default class Heading extends BlockAnnotation<{
  level: 1 | 2 | 3 | 4 | 5 | 6 | 100 | 101;
}> {
  static vendorPrefix = "gdocs";
  static type = "ps_hd";
}
