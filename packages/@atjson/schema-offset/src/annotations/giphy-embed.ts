import { IframeEmbed } from "./iframe-embed";

export class GiphyEmbed extends IframeEmbed {
  static type = "giphy-embed";
  static vendorPrefix = "offset";
}
