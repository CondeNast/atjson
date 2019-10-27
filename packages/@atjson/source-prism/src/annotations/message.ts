import { BlockAnnotation } from "@atjson/document";

export class Message extends BlockAnnotation {
  static vendorPrefix = "pam";
  static type = "message";
}
