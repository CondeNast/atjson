import { BlockAnnotation } from "@atjson/document";

export class FacebookEmbed extends BlockAnnotation<{
  /**
   * The URL to the embed on www.facebook.com
   */
  url: string;

  /**
   * If set to false, this excludes the text attached to a photo post.
   */
  showText?: boolean;

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
  static type = "facebook-embed";
  static vendorPrefix = "offset";
}
