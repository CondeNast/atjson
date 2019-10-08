import Document, { ObjectAnnotation } from "@atjson/document";
import CaptionSchema from "./caption-schema";

export class IframeEmbed extends ObjectAnnotation<{
  url: string;
  width?: string;
  height?: string;
  caption?: Document<typeof CaptionSchema>;
  sandbox?: string;
}> {
  static type = "iframe-embed";
  static vendorPrefix = "offset";
  static subdocuments = { caption: CaptionSchema };

  get url() {
    try {
      return new URL(this.attributes.url);
    } catch (e) {
      return null;
    }
  }
}
