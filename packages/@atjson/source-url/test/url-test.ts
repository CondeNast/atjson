import OffsetSource, { FacebookEmbed, GiphyEmbed, InstagramEmbed, PinterestEmbed, TwitterEmbed, YouTubeEmbed } from '@atjson/offset-annotations';
import CommonMarkRenderer from '@atjson/renderer-commonmark';
import URLSource from '../src/index';

// Renders embeds as WordPress style shortcodes
class EmbedRenderer extends CommonMarkRenderer {
  *'facebook-embed'(facebook: FacebookEmbed) {
    let iframeWidth = facebook.attributes.width;
    let width = '';
    if (iframeWidth) {
      width = ` data-width="${iframeWidth}"`;
    }
    return `<div class="fb-post" data-href="${facebook.attributes.url}"${width} data-show-text="true"></div>`;
  }

  *'giphy-embed'(giphy: GiphyEmbed) {
    return `<iframe src="${giphy.attributes.url}"></iframe>`;
  }

  *'instagram-embed'(instagram: InstagramEmbed) {
    return `<blockquote class="instagram-media" data-instgrm-permalink="${instagram.attributes.url}" data-instgrm-version="12"></blockquote>`;
  }

  *'pinterest-embed'(pinterest: PinterestEmbed) {
    return `<a href="${pinterest.attributes.url}" data-pin-do="embedPin" data-pin-width="large">${pinterest.attributes.url}</a>`;
  }

  *'twitter-embed'(tweet: TwitterEmbed) {
    return `<blockquote lang="en" data-type="twitter" data-url="${tweet.attributes.url}"><p><a href="${tweet.attributes.url}">${tweet.attributes.url}</a></p></blockquote>`;
  }

  *'youtube-embed'(video: YouTubeEmbed) {
    let { width, height } = video.attributes;
    let iframeWidth = width ? ` width=${width}` : '';
    let iframeHeight = height ? ` height=${height}` : '';
    return `<iframe${iframeWidth}${iframeHeight} src="${video.attributes.url}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
  }
}

describe('url-source', () => {
  test('text that is not a URL is returned as plain text', () => {
    let url = URLSource.fromRaw('Hi buddy!');
    let renderer = new EmbedRenderer();
    expect(renderer.render(url.convertTo(OffsetSource))).toBe('Hi buddy\\!');
  });

  test.each([
    'https://youtube.com',
    'https://twitter.com',
    'https://facebook.com',
    'https://pinterest.com'
  ])('URLs that do not match our embed expansion are displayed as text (%s)', text => {
    let url = URLSource.fromRaw(text);
    let renderer = new EmbedRenderer();
    expect(renderer.render(url.convertTo(OffsetSource))).toBe(text);
  });

  describe('instagram', () => {
    test.each([
      'https://www.instagram.com/p/Bnzz-g6gpwg/',
      'https://instagram.com/p/Bnzz-g6gpwg/?taken-by=lgbt_history',
      'https://www.instagr.am/p/Bnzz-g6gpwg',
      'https://instagr.am/p/Bnzz-g6gpwg/?taken-by=lgbt_history'
    ])('%s', text => {
      let url = URLSource.fromRaw(text);
      let renderer = new EmbedRenderer();
      expect(renderer.render(url.convertTo(OffsetSource))).toBe('<blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/Bnzz-g6gpwg" data-instgrm-version="12"></blockquote>');
    });
  });

  describe('twitter', () => {
    test.each([
      'https://twitter.com/jennschiffer/status/708888255828250625/',
      'https://m.twitter.com/jennschiffer/status/708888255828250625',
      'https://m.twitter.com/jennschiffer/status/708888255828250625?ref_src=twsrc%5Etfw%7Ctwcamp%5Etweetembed&ref_url=https%3A%2F%2Ftwitter.com%2Fjennschiffer%2Fstatus%2F708888255828250625'
    ])('%s', text => {
      let url = URLSource.fromRaw(text);
      let renderer = new EmbedRenderer();
      expect(renderer.render(url.convertTo(OffsetSource))).toBe('<blockquote lang=\"en\" data-type=\"twitter\" data-url=\"https://twitter.com/jennschiffer/status/708888255828250625\"><p><a href=\"https://twitter.com/jennschiffer/status/708888255828250625\">https://twitter.com/jennschiffer/status/708888255828250625</a></p></blockquote>');
    });
  });

  describe('youtube', () => {
    test.each([
      'https://www.youtube.com/watch?v=Mh5LY4Mz15o',
      'https://m.youtube.com/watch/?v=Mh5LY4Mz15o',
      'https://youtu.be/Mh5LY4Mz15o'
    ])('%s', text => {
      let url = URLSource.fromRaw(text);
      let renderer = new EmbedRenderer();
      expect(renderer.render(url.convertTo(OffsetSource))).toBe('<iframe src="https://www.youtube.com/embed/Mh5LY4Mz15o" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>');
    });

    test.each([
      'https://www.youtube-nocookie.com/embed/Mh5LY4Mz15o',
      'https://www.youtube-nocookie.com/embed/Mh5LY4Mz15ot=165'
    ])('%s', text => {
      let url = URLSource.fromRaw(text);
      let renderer = new EmbedRenderer();
      expect(renderer.render(url.convertTo(OffsetSource))).toBe(`<iframe src="${text}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`);
    });
  });

  describe('pinterest', () => {
    test('profile', () => {
      let url = URLSource.fromRaw('https://www.pinterest.com/alluremagazine/');
      let renderer = new EmbedRenderer();
      expect(renderer.render(url.convertTo(OffsetSource))).toBe('<a href="https://www.pinterest.com/alluremagazine/" data-pin-do="embedPin" data-pin-width="large">https://www.pinterest.com/alluremagazine/</a>');
    });

    test('board', () => {
      let url = URLSource.fromRaw('https://www.pinterest.com/alluremagazine/makeup-inspiration/');
      let renderer = new EmbedRenderer();
      expect(renderer.render(url.convertTo(OffsetSource))).toBe('<a href="https://www.pinterest.com/alluremagazine/makeup-inspiration/" data-pin-do="embedPin" data-pin-width="large">https://www.pinterest.com/alluremagazine/makeup-inspiration/</a>');
    });

    test('pin', () => {
      let url = URLSource.fromRaw('https://www.pinterest.com/pin/246290673356918386/');
      let renderer = new EmbedRenderer();
      expect(renderer.render(url.convertTo(OffsetSource))).toBe('<a href="https://www.pinterest.com/pin/246290673356918386/" data-pin-do="embedPin" data-pin-width="large">https://www.pinterest.com/pin/246290673356918386/</a>');
    });
  });

  describe('giphy', () => {
    test.each([
      'https://giphy.com/gifs/yosub-i-dont-know-her-3o7btW6jvrZduOA3ZK',
      'https://giphy.com/embed/3o7btW6jvrZduOA3ZK/'
    ])('%s', text => {
      let url = URLSource.fromRaw(text);
      let renderer = new EmbedRenderer();
      expect(renderer.render(url.convertTo(OffsetSource))).toBe('<iframe src="https://giphy.com/embed/3o7btW6jvrZduOA3ZK"></iframe>');
    });
  });

  describe('facebook', () => {
    describe('photos', () => {
      test.each([
        'https://www.facebook.com/Vogue/photos/a.71982647278/10156453076157279/?type=3&theater',
        'https://www.facebook.com/Vogue/posts/10156453076157279'
      ])('%s', text => {
        let url = URLSource.fromRaw(text);
        let renderer = new EmbedRenderer();
        expect(renderer.render(url.convertTo(OffsetSource))).toBe('<div class="fb-post" data-href="https://www.facebook.com/Vogue/posts/10156453076157279" data-show-text="true"></div>');
      });
    });

    describe('videos', () => {
      test.each([
        'https://www.facebook.com/Vogue/videos/vb.42933792278/258591818132754/?type=2&theater',
        'https://www.facebook.com/Vogue/posts/258591818132754'
      ])('%s', text => {
        let url = URLSource.fromRaw(text);
        let renderer = new EmbedRenderer();
        expect(renderer.render(url.convertTo(OffsetSource))).toBe('<div class="fb-post" data-href="https://www.facebook.com/Vogue/posts/258591818132754" data-show-text="true"></div>');
      });
    });
  });
});
