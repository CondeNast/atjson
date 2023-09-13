import { BlockAnnotation } from "@atjson/document";

export class TwitterEmbed extends BlockAnnotation<{
  /**
   * The embed URL to the post on www.x.com / www.twitter.com
   */
  url: string;

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
  static type = "twitter-embed";
  static vendorPrefix = "offset";
}
