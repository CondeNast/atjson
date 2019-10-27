import { BlockAnnotation } from "@atjson/document";

export class Description extends BlockAnnotation {
  static vendorPrefix = "dc";
  static type = "description";
}
