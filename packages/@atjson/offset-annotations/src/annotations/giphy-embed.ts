import IframeEmbed, { without } from './iframe-embed';

export default class GiphyEmbed extends IframeEmbed {
  static type = 'GiphyEmbed';
  static vendorPrefix = 'offset';

  get giphyId() {
    let url = this.url;
    if (url) {
      return without<string>(url.pathname.split('/'), '')[1];
    }
    return null;
  }
}
