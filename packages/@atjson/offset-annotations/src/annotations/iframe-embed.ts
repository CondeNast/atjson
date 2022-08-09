import { ObjectAnnotation } from "@atjson/document";

export class IframeEmbed extends ObjectAnnotation<{
  url: string;
  width?: string;
  height?: string;
  /**
   * Refers to a slice instead of being an
   * embedded document.
   */
  caption?: string;
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
