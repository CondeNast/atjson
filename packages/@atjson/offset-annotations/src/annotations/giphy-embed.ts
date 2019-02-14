import IframeEmbed, { without } from './iframe-embed';

export default class GiphyEmbed extends IframeEmbed {
  static type = 'giphy-embed';
  static vendorPrefix = 'offset';

  attributes!: {
    url: string,
    width?: string;
    height?: string;
  }
  get giphyId() {
    let url = this.url;
    if (url) {
      return without<string>(url.pathname.split('/'), '')[1];
    }
    return null;
  }
}
