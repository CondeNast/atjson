import { BlockAnnotation } from "@atjson/document";

export default class Heading extends BlockAnnotation {
  static type = "heading";
  static vendorPrefix = "commonmark";
  attributes!: {
    level: number;
  };
}
