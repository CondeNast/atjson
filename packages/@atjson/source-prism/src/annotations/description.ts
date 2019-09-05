import { BlockAnnotation } from "@atjson/document";

export default class Description extends BlockAnnotation {
  static vendorPrefix = "dc";
  static type = "description";
}
