import { BlockAnnotation } from "@atjson/document";

export default class BulletList extends BlockAnnotation<{
  tight: boolean;
}> {
  static type = "bullet_list";
  static vendorPrefix = "commonmark";
}
