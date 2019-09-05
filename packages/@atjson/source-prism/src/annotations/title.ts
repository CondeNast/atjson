import { BlockAnnotation } from "@atjson/document";

export default class Title extends BlockAnnotation {
  static vendorPrefix = "dc";
  static type = "title";
}
