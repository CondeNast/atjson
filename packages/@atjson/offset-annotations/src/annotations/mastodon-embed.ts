import { BlockAnnotation } from "@atjson/document";

/**
 * Fediverse embeds from Mastodon federated networks.
 */
export class MastodonEmbed extends BlockAnnotation<{
  /**
   * The URL of the mastodon toot.
   */
  url: string;

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
  static vendorPrefix = "offset";
  static type = "mastodon-embed";
}
