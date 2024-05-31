import { BlockAnnotation } from "@atjson/document";

export class FacebookEmbed extends BlockAnnotation<{
  /**
   * The URL to the embed on www.facebook.com
   */
  url: string;

  /**
   * If set to true, this hides the text attached to a photo post.
   */
  hideText?: boolean;

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
  static type = "facebook-embed";
  static vendorPrefix = "offset";
}
