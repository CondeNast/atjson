import { BlockAnnotation } from "@atjson/document";

export class Article extends BlockAnnotation {
  static vendorPrefix = "pam";
  static type = "article";
}
