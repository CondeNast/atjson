import { BlockAnnotation } from "@atjson/document";

export default class Article extends BlockAnnotation {
  static vendorPrefix = "pam";
  static type = "article";
}
