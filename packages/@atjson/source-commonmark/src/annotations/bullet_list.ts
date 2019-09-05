import { BlockAnnotation } from "@atjson/document";

export default class BulletList extends BlockAnnotation {
  static type = "bullet_list";
  static vendorPrefix = "commonmark";
  attributes!: {
    tight: boolean;
  };
}
