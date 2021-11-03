import { IframeEmbed } from "./iframe-embed";

export class RedditEmbed extends IframeEmbed<{
  /**
   * Attribute on the embed that the user sets in Reddit when choosing the embed.
   * This means that an image/video will show on the embed.
   */
  dataPreviewImage?: string;
  /**
   * This means that the embed is of that Reddit post at a certain timestamp. If the Reddit post
   * later changes and this attributes has been invoked, the embed will stay referencing the original timestamp.
   */
  dataCardCreated?: string;
}> {
  static type = "reddit-embed";
  static vendorPrefix = "offset";
}
