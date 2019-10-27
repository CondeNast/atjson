import { BlockAnnotation } from "@atjson/document";

export class BulletList extends BlockAnnotation<{
  tight: boolean;
}> {
  static type = "bullet_list";
  static vendorPrefix = "commonmark";
}
