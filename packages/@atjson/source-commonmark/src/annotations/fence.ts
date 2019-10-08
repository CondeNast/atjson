import { BlockAnnotation } from "@atjson/document";

export class Fence extends BlockAnnotation {
  static type = "fence";
  static vendorPrefix = "commonmark";
  attributes!: {
    info: string;
  };
}
