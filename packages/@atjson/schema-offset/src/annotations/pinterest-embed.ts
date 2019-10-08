import { without } from "../utils";
import { IframeEmbed } from "./iframe-embed";

export class PinterestEmbed extends IframeEmbed {
  static type = "pinterest-embed";
  static vendorPrefix = "offset";

  get isPin(): boolean {
    let url = this.url;
    if (url) {
      return without<string>(url.pathname.split("/"), "")[0] === "pin";
    }
    return false;
  }

  get isProfile(): boolean {
    let url = this.url;
    if (url) {
      return (
        !this.isPin && without<string>(url.pathname.split("/"), "").length === 2
      );
    }
    return false;
  }

  get isBoard() {
    let url = this.url;
    if (url) {
      return without<string>(url.pathname.split("/"), "").length === 1;
    }
    return false;
  }

  get pinId() {
    let url = this.url;
    if (this.isPin && url) {
      return without<string>(url.pathname.split("/"), "")[1];
    }
    return null;
  }

  get profileName() {
    let url = this.url;
    if (!this.isPin && url) {
      return without<string>(url.pathname.split("/"), "")[0];
    }
    return null;
  }
}
