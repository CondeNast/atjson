import { BlockAnnotation } from "@atjson/document";

export class BulletList extends BlockAnnotation {
  static type = "bullet_list";
  static vendorPrefix = "commonmark";
  attributes!: {
    tight: boolean;
  };
}
