import { BlockAnnotation } from "@atjson/document";

export class Pullquote extends BlockAnnotation {
  static type = "pullquote";
  static vendorPrefix = "offset";
}
