import IframeEmbed, { without } from "./iframe-embed";

export default class InstagramEmbed extends IframeEmbed {
  static type = "instagram-embed";
  static vendorPrefix = "offset";

  get shortcode(): string | null {
    let url = this.url;
    if (url) {
      return without<string>(url.pathname.split("/"), "")[1];
    }
    return null;
  }
}
