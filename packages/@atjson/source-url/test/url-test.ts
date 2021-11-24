import OffsetSource, {
  FacebookEmbed,
  GiphyEmbed,
  IframeEmbed,
  InstagramEmbed,
  PinterestEmbed,
  TikTokEmbed,
  TwitterEmbed,
  VideoEmbed,
} from "@atjson/offset-annotations";
import CommonMarkRenderer from "@atjson/renderer-commonmark";
import URLSource from "../src/index";

// Renders embeds as WordPress style shortcodes
class EmbedRenderer extends CommonMarkRenderer {
  *"facebook-embed"(facebook: FacebookEmbed) {
    let iframeWidth = facebook.attributes.width;
    let width = "";
    if (iframeWidth) {
      width = ` data-width="${iframeWidth}"`;
    }
    return `<div class="fb-post" data-href="${facebook.attributes.url}"${width} data-show-text="true"></div>`;
  }

  *"giphy-embed"(giphy: GiphyEmbed) {
    return `<iframe src="${giphy.attributes.url}"></iframe>`;
  }

  *"iframe-embed"(iframe: IframeEmbed) {
    let { url, height, width } = iframe.attributes;
    let sizeAttributes = "";
    if (height) {
      sizeAttributes += ` height="${height}"`;
    }
    if (width) {
      sizeAttributes += ` width="${width}"`;
    }

    return `<iframe src="${url}"${sizeAttributes}></iframe>`;
  }

  *"tiktok-embed"(tiktok: TikTokEmbed) {
    return `<blockquote class="tiktok-embed" cite="${tiktok.attributes.url}"></blockquote>`;
  }

  *"instagram-embed"(instagram: InstagramEmbed) {
    return `<blockquote class="instagram-media" data-instgrm-permalink="${instagram.attributes.url}" data-instgrm-version="12"></blockquote>`;
  }

  *"pinterest-embed"(pinterest: PinterestEmbed) {
    return `<a href="${pinterest.attributes.url}" data-pin-do="embedPin" data-pin-width="large">${pinterest.attributes.url}</a>`;
  }

  *"twitter-embed"(tweet: TwitterEmbed) {
    return `<blockquote lang="en" data-type="twitter" data-url="${tweet.attributes.url}"><p><a href="${tweet.attributes.url}">${tweet.attributes.url}</a></p></blockquote>`;
  }

  *"video-embed"(video: VideoEmbed) {
    return `<iframe src="${video.attributes.url}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
  }
}

describe("url-source", () => {
  test("text that is not a URL is returned as plain text", () => {
    let url = URLSource.fromRaw("Hi buddy!");
    expect(EmbedRenderer.render(url.convertTo(OffsetSource))).toBe(
      "Hi buddy\\!"
    );
  });

  test.each([
    "https://youtube.com",
    "https://twitter.com",
    "https://facebook.com",
    "https://pinterest.com",
    "https://spotify.com",
  ])(
    "URLs that do not match our embed expansion are displayed as text (%s)",
    (text) => {
      let url = URLSource.fromRaw(text);
      expect(EmbedRenderer.render(url.convertTo(OffsetSource))).toBe(text);
    }
  );

  describe("instagram", () => {
    test.each([
      "https://www.instagram.com/p/Bnzz-g6gpwg/",
      "https://instagram.com/p/Bnzz-g6gpwg/?taken-by=lgbt_history",
      "https://www.instagr.am/p/Bnzz-g6gpwg",
      "https://instagr.am/p/Bnzz-g6gpwg/?taken-by=lgbt_history",
    ])("%s", (text) => {
      let url = URLSource.fromRaw(text);
      expect(EmbedRenderer.render(url.convertTo(OffsetSource))).toBe(
        '<blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/Bnzz-g6gpwg" data-instgrm-version="12"></blockquote>'
      );
    });

    test.each([
      "https://www.instagram.com/tv/B95M4kNhbzz",
      "https://instagram.com/tv/B95M4kNhbzz/?utm_source=ig_web_copy_link",
      "https://instagr.am/tv/B95M4kNhbzz",
      "https://instagr.am/tv/B95M4kNhbzz/?utm_source=ig_web_copy_link",
    ])("%s", (text) => {
      let url = URLSource.fromRaw(text);
      expect(EmbedRenderer.render(url.convertTo(OffsetSource))).toBe(
        '<blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/tv/B95M4kNhbzz" data-instgrm-version="12"></blockquote>'
      );
    });
  });

  describe("twitter", () => {
    test.each([
      "https://twitter.com/jennschiffer/status/708888255828250625/",
      "https://m.twitter.com/jennschiffer/status/708888255828250625",
      "https://m.twitter.com/jennschiffer/status/708888255828250625?ref_src=twsrc%5Etfw%7Ctwcamp%5Etweetembed&ref_url=https%3A%2F%2Ftwitter.com%2Fjennschiffer%2Fstatus%2F708888255828250625",
    ])("%s", (text) => {
      let url = URLSource.fromRaw(text);
      expect(EmbedRenderer.render(url.convertTo(OffsetSource))).toBe(
        '<blockquote lang="en" data-type="twitter" data-url="https://twitter.com/jennschiffer/status/708888255828250625"><p><a href="https://twitter.com/jennschiffer/status/708888255828250625">https://twitter.com/jennschiffer/status/708888255828250625</a></p></blockquote>'
      );
    });
  });

  describe("youtube", () => {
    test.each([
      "https://www.youtube.com/watch?v=Mh5LY4Mz15o",
      "https://m.youtube.com/watch/?v=Mh5LY4Mz15o",
      "https://youtu.be/Mh5LY4Mz15o",
    ])("%s", (text) => {
      let url = URLSource.fromRaw(text);
      expect(EmbedRenderer.render(url.convertTo(OffsetSource))).toBe(
        '<iframe src="https://www.youtube.com/embed/Mh5LY4Mz15o" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>'
      );
    });

    test.each([
      "https://www.youtube.com/embed/Mh5LY4Mz15o",
      "https://www.youtube.com/embed/Mh5LY4Mz15o?start=165",
      "https://www.youtube.com/embed/Mh5LY4Mz15o?controls=0",
      "https://www.youtube.com/embed/Mh5LY4Mz15o?start=165&controls=0",
      "https://www.youtube-nocookie.com/embed/Mh5LY4Mz15o",
      "https://www.youtube-nocookie.com/embed/Mh5LY4Mz15o?start=165",
      "https://www.youtube-nocookie.com/embed/Mh5LY4Mz15o?controls=0",
      "https://www.youtube-nocookie.com/embed/Mh5LY4Mz15o?start=165&controls=0",
    ])("%s", (text) => {
      let url = URLSource.fromRaw(text);
      expect(EmbedRenderer.render(url.convertTo(OffsetSource))).toBe(
        `<iframe src="${text}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`
      );
    });
  });

  describe("vimeo", () => {
    test.each([
      "https://vimeo.com/156254412",
      "https://www.vimeo.com/156254412",
      "http://vimeo.com/156254412",
      "http://player.vimeo.com/video/156254412",
    ])("%s", (text) => {
      let url = URLSource.fromRaw(text);
      expect(EmbedRenderer.render(url.convertTo(OffsetSource))).toBe(
        '<iframe src="https://player.vimeo.com/video/156254412" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>'
      );
    });
  });

  describe("dailymotion", () => {
    test.each(["https://www.dailymotion.com/video/x6gmvnp"])("%s", (text) => {
      let url = URLSource.fromRaw(text);
      expect(EmbedRenderer.render(url.convertTo(OffsetSource))).toBe(
        '<iframe src="https://www.dailymotion.com/embed/video/x6gmvnp" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>'
      );
    });
  });

  describe("brightcove", () => {
    test.each([
      "https://players.brightcove.net/1752604059001/default_default/index.html?videoId=5802784116001",
    ])("%s", (url) => {
      let doc = URLSource.fromRaw(url);
      expect(EmbedRenderer.render(doc.convertTo(OffsetSource))).toBe(
        `<iframe src="${url}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`
      );
    });
  });

  describe("pinterest", () => {
    test("profile", () => {
      let url = URLSource.fromRaw("https://www.pinterest.com/alluremagazine/");
      expect(EmbedRenderer.render(url.convertTo(OffsetSource))).toBe(
        '<a href="https://www.pinterest.com/alluremagazine/" data-pin-do="embedPin" data-pin-width="large">https://www.pinterest.com/alluremagazine/</a>'
      );
    });

    test("board", () => {
      let url = URLSource.fromRaw(
        "https://www.pinterest.com/alluremagazine/makeup-inspiration/"
      );
      expect(EmbedRenderer.render(url.convertTo(OffsetSource))).toBe(
        '<a href="https://www.pinterest.com/alluremagazine/makeup-inspiration/" data-pin-do="embedPin" data-pin-width="large">https://www.pinterest.com/alluremagazine/makeup-inspiration/</a>'
      );
    });

    test("pin", () => {
      let url = URLSource.fromRaw(
        "https://www.pinterest.com/pin/246290673356918386/"
      );
      expect(EmbedRenderer.render(url.convertTo(OffsetSource))).toBe(
        '<a href="https://www.pinterest.com/pin/246290673356918386/" data-pin-do="embedPin" data-pin-width="large">https://www.pinterest.com/pin/246290673356918386/</a>'
      );
    });
  });

  describe("giphy", () => {
    test.each([
      "https://giphy.com/gifs/yosub-i-dont-know-her-3o7btW6jvrZduOA3ZK",
      "https://giphy.com/embed/3o7btW6jvrZduOA3ZK/",
    ])("%s", (text) => {
      let url = URLSource.fromRaw(text);
      expect(EmbedRenderer.render(url.convertTo(OffsetSource))).toBe(
        '<iframe src="https://giphy.com/embed/3o7btW6jvrZduOA3ZK"></iframe>'
      );
    });
  });

  describe("facebook", () => {
    describe("photos", () => {
      test.each([
        "https://www.facebook.com/Vogue/photos/a.71982647278/10156453076157279/?type=3&theater",
        "https://www.facebook.com/Vogue/posts/10156453076157279",
      ])("%s", (text) => {
        let url = URLSource.fromRaw(text);
        expect(EmbedRenderer.render(url.convertTo(OffsetSource))).toBe(
          '<div class="fb-post" data-href="https://www.facebook.com/Vogue/posts/10156453076157279" data-show-text="true"></div>'
        );
      });
    });

    describe("videos", () => {
      test.each([
        "https://www.facebook.com/Vogue/videos/vb.42933792278/258591818132754/?type=2&theater",
        "https://www.facebook.com/Vogue/posts/258591818132754",
      ])("%s", (text) => {
        let url = URLSource.fromRaw(text);
        expect(EmbedRenderer.render(url.convertTo(OffsetSource))).toBe(
          '<div class="fb-post" data-href="https://www.facebook.com/Vogue/posts/258591818132754" data-show-text="true"></div>'
        );
      });
    });

    describe("embed url", () => {
      test("https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2FBeethovenOfficialPage%2Fposts%2F2923157684380743&width=500", () => {
        let url = URLSource.fromRaw(
          "https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2FBeethovenOfficialPage%2Fposts%2F2923157684380743"
        );
        expect(EmbedRenderer.render(url.convertTo(OffsetSource))).toBe(
          '<div class="fb-post" data-href="https://www.facebook.com/BeethovenOfficialPage/posts/2923157684380743" data-show-text="true"></div>'
        );
      });
    });
  });

  describe("TikTok", () => {
    test.each([
      "https://www.tiktok.com/@vogueitalia/video/6771026615137750277",
      "https://m.tiktok.com/@vogueitalia/video/6771026615137750277",
      "http://www.tiktok.com/@vogueitalia/video/6771026615137750277",
      "http://m.tiktok.com/@vogueitalia/video/6771026615137750277",
    ])("%s", (text) => {
      let url = URLSource.fromRaw(text);
      expect(EmbedRenderer.render(url.convertTo(OffsetSource))).toBe(
        '<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@vogueitalia/video/6771026615137750277"></blockquote>'
      );
    });
  });

  describe("spotify", () => {
    test.each([
      [
        "https://open.spotify.com/track/5e0vgBWfwToyphURwynSXa?si=xxxxxxxxxxxxxxx",
        '<iframe src="https://open.spotify.com/embed/track/5e0vgBWfwToyphURwynSXa" height="80" width="300"></iframe>',
      ],
      [
        "https://open.spotify.com/embed/track/5e0vgBWfwToyphURwynSXa?si=xxxxxxxxxxxxxxx",
        '<iframe src="https://open.spotify.com/embed/track/5e0vgBWfwToyphURwynSXa" height="80" width="300"></iframe>',
      ],
      [
        "https://open.spotify.com/album/6UjZgFbK6CQptu8aOobzPV?si=xxxxxxxxxxxxxxx",
        '<iframe src="https://open.spotify.com/embed/album/6UjZgFbK6CQptu8aOobzPV" height="380" width="300"></iframe>',
      ],
      [
        "https://open.spotify.com/embed/album/6UjZgFbK6CQptu8aOobzPV?si=xxxxxxxxxxxxxxx",
        '<iframe src="https://open.spotify.com/embed/album/6UjZgFbK6CQptu8aOobzPV" height="380" width="300"></iframe>',
      ],
      [
        "https://open.spotify.com/artist/6sFIWsNpZYqfjUpaCgueju?si=xxxxxxxxxxxxxxx",
        '<iframe src="https://open.spotify.com/embed/artist/6sFIWsNpZYqfjUpaCgueju" height="380" width="300"></iframe>',
      ],
      [
        "https://open.spotify.com/embed/artist/6sFIWsNpZYqfjUpaCgueju?si=xxxxxxxxxxxxxxx",
        '<iframe src="https://open.spotify.com/embed/artist/6sFIWsNpZYqfjUpaCgueju" height="380" width="300"></iframe>',
      ],
      [
        "https://open.spotify.com/playlist/2s1HL7UaXEPWqJR4E1Gt1A?si=xxxxxxxxxxxxxxx",
        '<iframe src="https://open.spotify.com/embed/playlist/2s1HL7UaXEPWqJR4E1Gt1A" height="380" width="300"></iframe>',
      ],
      [
        "https://open.spotify.com/embed/playlist/2s1HL7UaXEPWqJR4E1Gt1A?si=xxxxxxxxxxxxxxx",
        '<iframe src="https://open.spotify.com/embed/playlist/2s1HL7UaXEPWqJR4E1Gt1A" height="380" width="300"></iframe>',
      ],
    ])("%s", (url, rendered) => {
      let doc = URLSource.fromRaw(url).convertTo(OffsetSource);
      expect(EmbedRenderer.render(doc)).toBe(rendered);
    });
  });
  describe("reddit", () => {
    test.each([
      [
        "https://www.redditmedia.com/r/AskReddit/comments/quu4c5/as_you_get_older_whats_something_that_becomes/",
        '<iframe src="https://www.redditmedia.com/r/AskReddit/comments/quu4c5/as_you_get_older_whats_something_that_becomes/?ref_source=embed&amp;ref=share&amp;embed=true" height="141" width="640"></iframe>',
      ],
      [
        "https://www.reddit.com/r/AskReddit/comments/quu4c5/as_you_get_older_whats_something_that_becomes/",
        '<iframe src="https://www.redditmedia.com/r/AskReddit/comments/quu4c5/as_you_get_older_whats_something_that_becomes/?ref_source=embed&amp;ref=share&amp;embed=true" height="141" width="640"></iframe>',
      ],
    ])("%s", (url, rendered) => {
      let doc = URLSource.fromRaw(url).convertTo(OffsetSource);
      expect(EmbedRenderer.render(doc)).toBe(rendered);
    });
  });
});
