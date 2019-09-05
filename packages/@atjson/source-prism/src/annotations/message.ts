import { BlockAnnotation } from "@atjson/document";

export default class Message extends BlockAnnotation {
  static vendorPrefix = "pam";
  static type = "message";
}
