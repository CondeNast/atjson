import { BlockAnnotation } from "@atjson/document";

export default class Pullquote extends BlockAnnotation {
  static type = "pullquote";
  static vendorPrefix = "offset";
}
