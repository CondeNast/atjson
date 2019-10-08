import { BlockAnnotation } from "@atjson/document";

export class Heading extends BlockAnnotation<{
  level: number;
}> {
  static type = "heading";
  static vendorPrefix = "commonmark";
}
