import { BlockAnnotation } from "@atjson/document";

export class Title extends BlockAnnotation {
  static vendorPrefix = "dc";
  static type = "title";
}
