import { ObjectAnnotation } from "@atjson/document";
import { CaptionSource } from "./caption-source";

export class IframeEmbed extends ObjectAnnotation<{
  url: string;
  width?: string;
  height?: string;
  caption?: CaptionSource;
  sandbox?: string;
  /**
   * A named identifier used to quickly jump to this item
   */
  anchorName?: string;
}> {
  static type = "iframe-embed";
  static vendorPrefix = "offset";
  static subdocuments = { caption: CaptionSource };

  get url() {
    try {
      return new URL(this.attributes.url);
    } catch (e) {
      return null;
    }
  }
}
