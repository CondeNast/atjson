import { BlockAnnotation } from "@atjson/document";

export class Sidebar extends BlockAnnotation<{
  inset?: "left" | "right";
}> {
  static type = "sidebar";
  static vendorPrefix = "offset";
}
