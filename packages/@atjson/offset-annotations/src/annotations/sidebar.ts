import { BlockAnnotation } from "@atjson/document";

/**
 * Sidebar is a callout whose contents should be placed adjacent to
 * the body, graphically separate but with contextual connection.
 **/

export class Sidebar extends BlockAnnotation<{
  inset?: "left" | "right";
}> {
  static type = "sidebar";
  static vendorPrefix = "offset";
}
