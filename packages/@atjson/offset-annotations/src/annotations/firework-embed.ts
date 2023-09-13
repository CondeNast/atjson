import { BlockAnnotation } from "@atjson/document";

export class FireworkEmbed extends BlockAnnotation<{
  /**
   * The id of the Firework video playlist.
   */
  playlistId: string;

  /**
   * The channel used to track Firework video embeds.
   */
  channel?: string;

  /**
   * Deterimines how the video should open when they
   * are clicked.
   */
  open?: "default" | "_self" | "_modal" | "_blank";

  /**
   * Layout information, used to indicate mutually
   * exclusive layouts, for example sizes, floats, etc.
   */
  layout?: string;

  /**
   * A named identifier used to quickly jump to this item
   */
  anchorName?: string;
}> {
  static vendorPrefix = "offset";
  static type = "firework-embed";
}
