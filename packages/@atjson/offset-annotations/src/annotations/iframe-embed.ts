import { BlockAnnotation } from "@atjson/document";

export class IframeEmbed extends BlockAnnotation<{
  /**
   * The embed URL to host in the iframe.
   */
  url: string;

  /**
   * The width of the embed, as a valid CSS unit
   * (rem, em, pixels, percentages).
   */
  width?: string;

  /**
   * The height of the embed, as a valid CSS unit
   * (rem, em, pixels, percentages).
   */
  height?: string;

  /**
   * Refers to a slice instead of being an embedded document.
   */
  caption?: string;

  /**
   * Layout information, used to indicate mutually
   * exclusive layouts, for example sizes, floats, etc.
   *
   * For iframe embeds, this may be used to flex an iframe
   * with sizing using percentages.
   */
  layout?: string;

  /**
   * Sandbox properties that indicate what permissions are required
   * by the embedded context so it can run correctly.
   */
  sandbox?: string;

  /**
   * A named identifier used to quickly jump to this item
   */
  anchorName?: string;
}> {
  static type = "iframe-embed";
  static vendorPrefix = "offset";

  get url() {
    try {
      return new URL(this.attributes.url);
    } catch (e) {
      return null;
    }
  }
}
