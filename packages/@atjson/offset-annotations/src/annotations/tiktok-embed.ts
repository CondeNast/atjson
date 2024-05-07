import { BlockAnnotation } from "@atjson/document";

export class TikTokEmbed extends BlockAnnotation<{
  /**
   * The URL to the TikTok video on www.tiktok.com
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
  static type = "tiktok-embed";
  static vendorPrefix = "offset";
}
