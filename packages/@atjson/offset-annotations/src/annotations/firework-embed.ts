import { BlockAnnotation } from "@atjson/document";

export class FireworkEmbed extends BlockAnnotation<{
  playlistId: string;
  channel?: string;
  open?: "default" | "_self" | "_modal" | "_blank";
  /**
   * A named identifier used to quickly jump to this item
   */
  anchorName?: string;
}> {
  static vendorPrefix = "offset";
  static type = "firework-embed";
}
