import { BlockAnnotation } from "@atjson/document";

export default class Fence extends BlockAnnotation<{
  info: string;
}> {
  static type = "fence";
  static vendorPrefix = "commonmark";
}
