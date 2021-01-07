import { BlockAnnotation } from "@atjson/document";

export class BulletList extends BlockAnnotation<{
  loose: boolean;
}> {
  static type = "bullet_list";
  static vendorPrefix = "commonmark";
}
