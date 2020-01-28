import { BlockAnnotation } from "@atjson/document";

export class Paragraph extends BlockAnnotation {
  static vendorPrefix = "mobiledoc";
  static type = "p";

  get rank() {
    return 15;
  }
}
