import IframeEmbed from './iframe-embed';

export default class FacebookEmbed extends IframeEmbed {
  static type = 'facebook-embed';
  static vendorPrefix = 'offset';

  get embedURL() {
    return `https://www.facebook.com/${this.attributes.username}/posts/${this.attributes.postId}`;
  }
}
