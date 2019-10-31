import { BlockAnnotation } from "@atjson/document";

export default class Section extends BlockAnnotation {
  static vendorPrefix = "offset";
  static type = "section";
}
