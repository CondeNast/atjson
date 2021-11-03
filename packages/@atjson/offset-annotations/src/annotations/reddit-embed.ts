import { IframeEmbed } from "./iframe-embed";

export class RedditEmbed extends IframeEmbed {
  static type = "reddit-embed";
  static vendorPrefix = "offset";
}
