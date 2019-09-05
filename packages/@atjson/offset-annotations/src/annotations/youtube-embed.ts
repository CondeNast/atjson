import IframeEmbed, { without } from "./iframe-embed";

export default class YouTubeEmbed extends IframeEmbed {
  static type = "youtube-embed";
  static vendorPrefix = "offset";

  get videoId() {
    let url = this.url;
    if (url) {
      return without<string>(url.pathname.split("/"), "")[1];
    }
    return null;
  }

  get startsAt(): number {
    let url = this.url;
    if (url) {
      return parseInt(url.searchParams.get("t") || "0", 10);
    }
    return 0;
  }

  set startsAt(seconds: number) {
    let url = this.url;
    if (url) {
      if (seconds === 0) {
        url.searchParams.delete("t");
      } else {
        url.searchParams.set("t", seconds.toString());
      }
      this.attributes.url = url.toString();
    }
  }

  get isPlayerInfoShown(): boolean {
    let url = this.url;
    if (url) {
      return url.searchParams.get("showinfo") === "0";
    }
    return false;
  }

  set isPlayerInfoShown(shown: boolean) {
    let url = this.url;
    if (url) {
      if (shown) {
        url.searchParams.delete("showinfo");
      } else {
        url.searchParams.set("showinfo", "0");
      }
      this.attributes.url = url.toString();
    }
  }

  get areRelatedVideosShown(): boolean {
    let url = this.url;
    if (url) {
      return url.searchParams.get("rel") === "0";
    }
    return false;
  }

  set areRelatedVideosShown(shown: boolean) {
    let url = this.url;
    if (url) {
      if (shown) {
        url.searchParams.delete("rel");
      } else {
        url.searchParams.set("rel", "0");
      }
      this.attributes.url = url.toString();
    }
  }

  get areControlsShown(): boolean {
    let url = this.url;
    if (url) {
      return url.searchParams.get("controls") === "0";
    }
    return false;
  }

  set areControlsShown(shown: boolean) {
    let url = this.url;
    if (url) {
      if (shown) {
        url.searchParams.delete("controls");
      } else {
        url.searchParams.set("controls", "0");
      }
      this.attributes.url = url.toString();
    }
  }

  get isUsingCookielessDomain(): boolean {
    let url = this.url;
    if (url) {
      return url.host === "www.youtube-nocookie.com";
    }
    return false;
  }

  set isUsingCookielessDomain(cookieless: boolean) {
    let url = this.url;
    if (url) {
      if (cookieless) {
        url.host = "www.youtube-nocookie.com";
      } else {
        url.host = "www.youtube.com";
      }
      this.attributes.url = url.toString();
    }
  }
}
