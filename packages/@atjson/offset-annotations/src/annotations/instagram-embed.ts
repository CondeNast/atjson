import IframeEmbed, { without } from './iframe-embed';

export default class InstagramEmbed extends IframeEmbed {
  static type = 'instagram-embed';
  static vendorPrefix = 'offset';

  get shortcode(): string | null {
    let url = this.url;
    if (url) {
      return without<string>(url.pathname.split('/'), '')[1];
    }
    return null;
  }

  get isCaptioned(): boolean {
    let url = this.url;
    if (url) {
      return without<string>(url.pathname.split('/'), '')[3] === 'captioned';
    }
    return false;
  }

  set isCaptioned(captioned: boolean) {
    let url = this.url;
    if (url) {
      if (captioned) {
        url.pathname = `/p/${this.shortcode}/embed/captioned`;
      } else {
        url.pathname = `/p/${this.shortcode}/embed`;
      }
      this.attributes.url = url.toString();
    }
  }
}
