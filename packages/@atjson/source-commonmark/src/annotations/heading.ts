import { BlockAnnotation } from "@atjson/document";

export default class Heading extends BlockAnnotation<{
  level: number;
}> {
  static type = "heading";
  static vendorPrefix = "commonmark";
}
