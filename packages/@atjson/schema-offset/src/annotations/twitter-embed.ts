import { without } from "../utils";
import { IframeEmbed } from "./iframe-embed";

export class TwitterEmbed extends IframeEmbed {
  static type = "twitter-embed";
  static vendorPrefix = "offset";

  get tweetBy() {
    let url = this.url;
    if (url) {
      return without<string>(url.pathname.split("/"), "")[0];
    }
    return null;
  }

  get tweetId() {
    let url = this.url;
    if (url) {
      return without<string>(url.pathname.split("/"), "")[2];
    }
    return null;
  }
}
