import { IframeEmbed } from "./iframe-embed";

export class InstagramEmbed extends IframeEmbed<{ captioned?: boolean }> {
  static type = "instagram-embed";
  static vendorPrefix = "offset";
}
