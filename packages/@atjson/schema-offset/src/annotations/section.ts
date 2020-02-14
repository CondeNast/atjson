import { BlockAnnotation } from "@atjson/document";

export class Section extends BlockAnnotation {
  static vendorPrefix = "offset";
  static type = "section";
}
