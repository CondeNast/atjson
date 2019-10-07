import { ObjectAnnotation } from "@atjson/document";
import CaptionSource from "./caption-source";

export default class IframeEmbed extends ObjectAnnotation<{
  url: string;
  width?: string;
  height?: string;
  caption?: CaptionSource;
  sandbox?: string;
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
