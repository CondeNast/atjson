import { BlockAnnotation } from "@atjson/document";

export class BlueskyEmbed extends BlockAnnotation<{
  /**
   * The at protocol uri of the Bluesky embed
   */
  uri: string;

  /**
   * The IPFS content id of the post.
   */
  cid: string;

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
  static type = "bluesky-embed";
}
