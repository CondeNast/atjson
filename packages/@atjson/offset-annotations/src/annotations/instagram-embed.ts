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
  hidePostCaption?: boolean;

  /**
   * Layout information, used to indicate mutually
   * exclusive layouts, for example sizes, floats, etc.
   */
  layout?: string;

  /**
   * A named identifier used to quickly jump to this item
   */
  anchorName?: string;

  /**
   * The post content at the time of embedding, ususally
   * a textual representation of the content with some links.
   */
  content?: string;
}> {
  static type = "instagram-embed";
  static vendorPrefix = "offset";
}
