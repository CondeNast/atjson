import { IframeEmbed, without } from "./iframe-embed";

export class GiphyEmbed extends IframeEmbed {
  static type = "giphy-embed";
  static vendorPrefix = "offset";

  get giphyId() {
    let url = this.url;
    if (url) {
      return without<string>(url.pathname.split("/"), "")[1]
        .split("-")
        .slice(-1)[0];
    }
    return null;
  }
}
