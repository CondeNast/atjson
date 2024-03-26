import { BlockAnnotation } from "@atjson/document";

export class InstagramEmbed extends BlockAnnotation<{
  /**
   * The URL to the post on www.instagram.com
   */
  url: string;

  /**
   * If set to false, this excludes the caption attached to the post.
   * This maps to the `captioned` option on the embed.
   */
  excludePostCaption?: boolean;

  /**
   * Refers to a slice instead of being an embedded document.
   */
  caption?: string;

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
  static type = "instagram-embed";
  static vendorPrefix = "offset";
}
