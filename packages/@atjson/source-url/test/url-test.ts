import { serialize } from "@atjson/document";
import OffsetSource, { VideoURLs } from "@atjson/offset-annotations";
import URLSource from "../src";

describe("url-source", () => {
  test("text that is not a URL is returned as plain text", () => {
    expect(
      serialize(URLSource.fromRaw("Hi buddy!").convertTo(OffsetSource), {
        withStableIds: true,
      })
    ).toMatchObject({
      text: `\uFFFCHi buddy!`,
      blocks: [
        {
          type: "text",
        },
      ],
      marks: [],
    });
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
      expect(
        serialize(URLSource.fromRaw(text).convertTo(OffsetSource), {
          withStableIds: true,
        })
      ).toMatchObject({
        text: `\uFFFC${text}`,
        blocks: [
          {
            type: "text",
          },
        ],
        marks: [],
      });
    }
  );

  describe("instagram", () => {
    test.each([
      "https://www.instagram.com/p/Bnzz-g6gpwg/",
      "https://instagram.com/p/Bnzz-g6gpwg/?taken-by=lgbt_history",
      "https://www.instagr.am/p/Bnzz-g6gpwg",
      "https://instagr.am/p/Bnzz-g6gpwg/?taken-by=lgbt_history",
    ])("%s", (text) => {
      let url = URLSource.fromRaw(text).convertTo(OffsetSource);
      expect(serialize(url, { withStableIds: true })).toEqual({
        text: "\uFFFC",
        blocks: [
          {
            id: "B00000000",
            parents: [],
            selfClosing: false,
            type: "instagram-embed",
            attributes: {
              url: "https://www.instagram.com/p/Bnzz-g6gpwg",
            },
          },
        ],
        marks: [],
      });
    });

    test.each([
      "https://www.instagram.com/tv/B95M4kNhbzz",
      "https://instagram.com/tv/B95M4kNhbzz/?utm_source=ig_web_copy_link",
      "https://instagr.am/tv/B95M4kNhbzz",
      "https://instagr.am/tv/B95M4kNhbzz/?utm_source=ig_web_copy_link",
    ])("%s", (text) => {
      let url = URLSource.fromRaw(text).convertTo(OffsetSource);
      expect(serialize(url, { withStableIds: true })).toEqual({
        text: "\uFFFC",
        blocks: [
          {
            id: "B00000000",
            parents: [],
            selfClosing: false,
            type: "instagram-embed",
            attributes: {
              url: "https://www.instagram.com/tv/B95M4kNhbzz",
            },
          },
        ],
        marks: [],
      });
    });
  });

  describe("twitter", () => {
    test.each([
      "https://twitter.com/jennschiffer/status/708888255828250625/",
      "https://m.twitter.com/jennschiffer/status/708888255828250625",
      "https://m.twitter.com/jennschiffer/status/708888255828250625?ref_src=twsrc%5Etfw%7Ctwcamp%5Etweetembed&ref_url=https%3A%2F%2Ftwitter.com%2Fjennschiffer%2Fstatus%2F708888255828250625",
    ])("%s", (text) => {
      let url = URLSource.fromRaw(text).convertTo(OffsetSource);
      expect(serialize(url, { withStableIds: true })).toEqual({
        text: "\uFFFC",
        blocks: [
          {
            id: "B00000000",
            parents: [],
            selfClosing: false,
            type: "twitter-embed",
            attributes: {
              url: "https://twitter.com/jennschiffer/status/708888255828250625",
            },
          },
        ],
        marks: [],
      });
    });
  });

  describe("youtube", () => {
    test.each([
      "https://www.youtube.com/watch?v=Mh5LY4Mz15o",
      "https://m.youtube.com/watch/?v=Mh5LY4Mz15o",
      "https://youtu.be/Mh5LY4Mz15o",
    ])("%s", (text) => {
      let url = URLSource.fromRaw(text).convertTo(OffsetSource);
      expect(serialize(url, { withStableIds: true })).toEqual({
        text: "\uFFFC",
        blocks: [
          {
            id: "B00000000",
            parents: [],
            selfClosing: false,
            type: "video-embed",
            attributes: {
              provider: VideoURLs.Provider.YOUTUBE,
              url: "https://www.youtube.com/embed/Mh5LY4Mz15o",
            },
          },
        ],
        marks: [],
      });
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
      let url = URLSource.fromRaw(text).convertTo(OffsetSource);
      expect(serialize(url, { withStableIds: true })).toEqual({
        text: "\uFFFC",
        blocks: [
          {
            id: "B00000000",
            parents: [],
            selfClosing: false,
            type: "video-embed",
            attributes: {
              provider: VideoURLs.Provider.YOUTUBE,
              url: text,
            },
          },
        ],
        marks: [],
      });
    });
  });

  describe("vimeo", () => {
    test.each([
      "https://vimeo.com/156254412",
      "https://www.vimeo.com/156254412",
      "http://vimeo.com/156254412",
      "http://player.vimeo.com/video/156254412",
    ])("%s", (text) => {
      let url = URLSource.fromRaw(text).convertTo(OffsetSource);
      expect(serialize(url, { withStableIds: true })).toEqual({
        text: "\uFFFC",
        blocks: [
          {
            id: "B00000000",
            parents: [],
            selfClosing: false,
            type: "video-embed",
            attributes: {
              provider: VideoURLs.Provider.VIMEO,
              url: "https://player.vimeo.com/video/156254412",
            },
          },
        ],
        marks: [],
      });
    });
  });

  describe("dailymotion", () => {
    test.each(["https://www.dailymotion.com/video/x6gmvnp"])("%s", (text) => {
      let url = URLSource.fromRaw(text).convertTo(OffsetSource);
      expect(serialize(url, { withStableIds: true })).toEqual({
        text: "\uFFFC",
        blocks: [
          {
            id: "B00000000",
            parents: [],
            selfClosing: false,
            type: "video-embed",
            attributes: {
              provider: VideoURLs.Provider.DAILYMOTION,
              url: "https://www.dailymotion.com/embed/video/x6gmvnp",
            },
          },
        ],
        marks: [],
      });
    });
  });

  describe("brightcove", () => {
    test.each([
      "https://players.brightcove.net/1752604059001/default_default/index.html?videoId=5802784116001",
    ])("%s", (url) => {
      let doc = URLSource.fromRaw(url).convertTo(OffsetSource);
      expect(serialize(doc, { withStableIds: true })).toEqual({
        text: "\uFFFC",
        blocks: [
          {
            id: "B00000000",
            parents: [],
            selfClosing: false,
            type: "video-embed",
            attributes: {
              provider: VideoURLs.Provider.BRIGHTCOVE,
              url,
            },
          },
        ],
        marks: [],
      });
    });
  });

  describe("pinterest", () => {
    test("profile", () => {
      let url = URLSource.fromRaw(
        "https://www.pinterest.com/alluremagazine/"
      ).convertTo(OffsetSource);
      expect(serialize(url, { withStableIds: true })).toEqual({
        text: "\uFFFC",
        blocks: [
          {
            id: "B00000000",
            parents: [],
            selfClosing: false,
            type: "pinterest-embed",
            attributes: {
              url: "https://www.pinterest.com/alluremagazine/",
            },
          },
        ],
        marks: [],
      });
    });

    test("board", () => {
      let url = URLSource.fromRaw(
        "https://www.pinterest.com/alluremagazine/makeup-inspiration/"
      ).convertTo(OffsetSource);
      expect(serialize(url, { withStableIds: true })).toEqual({
        text: "\uFFFC",
        blocks: [
          {
            id: "B00000000",
            parents: [],
            selfClosing: false,
            type: "pinterest-embed",
            attributes: {
              url: "https://www.pinterest.com/alluremagazine/makeup-inspiration/",
            },
          },
        ],
        marks: [],
      });
    });

    test("pin", () => {
      let url = URLSource.fromRaw(
        "https://www.pinterest.com/pin/246290673356918386/"
      ).convertTo(OffsetSource);
      expect(serialize(url, { withStableIds: true })).toEqual({
        text: "\uFFFC",
        blocks: [
          {
            id: "B00000000",
            parents: [],
            selfClosing: false,
            type: "pinterest-embed",
            attributes: {
              url: "https://www.pinterest.com/pin/246290673356918386/",
            },
          },
        ],
        marks: [],
      });
    });
  });

  describe("giphy", () => {
    test.each([
      "https://giphy.com/gifs/yosub-i-dont-know-her-3o7btW6jvrZduOA3ZK",
      "https://giphy.com/embed/3o7btW6jvrZduOA3ZK/",
    ])("%s", (text) => {
      let url = URLSource.fromRaw(text).convertTo(OffsetSource);
      expect(serialize(url, { withStableIds: true })).toEqual({
        text: "\uFFFC",
        blocks: [
          {
            id: "B00000000",
            parents: [],
            selfClosing: false,
            type: "giphy-embed",
            attributes: {
              url: "https://giphy.com/embed/3o7btW6jvrZduOA3ZK",
            },
          },
        ],
        marks: [],
      });
    });
  });

  describe("facebook", () => {
    describe("photos", () => {
      test.each([
        "https://www.facebook.com/Vogue/photos/a.71982647278/10156453076157279/?type=3&theater",
        "https://www.facebook.com/Vogue/posts/10156453076157279",
      ])("%s", (text) => {
        let url = URLSource.fromRaw(text).convertTo(OffsetSource);
        expect(serialize(url, { withStableIds: true })).toEqual({
          text: "\uFFFC",
          blocks: [
            {
              id: "B00000000",
              parents: [],
              selfClosing: false,
              type: "facebook-embed",
              attributes: {
                url: "https://www.facebook.com/Vogue/posts/10156453076157279",
              },
            },
          ],
          marks: [],
        });
      });
    });

    describe("videos", () => {
      test.each([
        "https://www.facebook.com/Vogue/videos/vb.42933792278/258591818132754/?type=2&theater",
        "https://www.facebook.com/Vogue/posts/258591818132754",
      ])("%s", (text) => {
        let url = URLSource.fromRaw(text).convertTo(OffsetSource);
        expect(serialize(url, { withStableIds: true })).toEqual({
          text: "\uFFFC",
          blocks: [
            {
              id: "B00000000",
              parents: [],
              selfClosing: false,
              type: "facebook-embed",
              attributes: {
                url: "https://www.facebook.com/Vogue/posts/258591818132754",
              },
            },
          ],
          marks: [],
        });
      });
    });

    describe("embed url", () => {
      test("https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2FBeethovenOfficialPage%2Fposts%2F2923157684380743&width=500", () => {
        let url = URLSource.fromRaw(
          "https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2FBeethovenOfficialPage%2Fposts%2F2923157684380743"
        ).convertTo(OffsetSource);
        expect(serialize(url, { withStableIds: true })).toEqual({
          text: "\uFFFC",
          blocks: [
            {
              id: "B00000000",
              parents: [],
              selfClosing: false,
              type: "facebook-embed",
              attributes: {
                url: "https://www.facebook.com/BeethovenOfficialPage/posts/2923157684380743",
              },
            },
          ],
          marks: [],
        });
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
      let url = URLSource.fromRaw(text).convertTo(OffsetSource);
      expect(serialize(url, { withStableIds: true })).toEqual({
        text: "\uFFFC",
        blocks: [
          {
            id: "B00000000",
            parents: [],
            selfClosing: false,
            type: "tiktok-embed",
            attributes: {
              url: "https://www.tiktok.com/@vogueitalia/video/6771026615137750277",
            },
          },
        ],
        marks: [],
      });
    });
  });

  describe("spotify", () => {
    test.each([
      [
        "https://open.spotify.com/track/5e0vgBWfwToyphURwynSXa?si=xxxxxxxxxxxxxxx",
        {
          url: "https://open.spotify.com/embed/track/5e0vgBWfwToyphURwynSXa",
          height: "80",
          width: "300",
        },
      ],
      [
        "https://open.spotify.com/embed/track/5e0vgBWfwToyphURwynSXa?si=xxxxxxxxxxxxxxx",
        {
          url: "https://open.spotify.com/embed/track/5e0vgBWfwToyphURwynSXa",
          height: "80",
          width: "300",
        },
      ],
      [
        "https://open.spotify.com/album/6UjZgFbK6CQptu8aOobzPV?si=xxxxxxxxxxxxxxx",
        {
          url: "https://open.spotify.com/embed/album/6UjZgFbK6CQptu8aOobzPV",
          height: "380",
          width: "300",
        },
      ],
      [
        "https://open.spotify.com/embed/album/6UjZgFbK6CQptu8aOobzPV?si=xxxxxxxxxxxxxxx",
        {
          url: "https://open.spotify.com/embed/album/6UjZgFbK6CQptu8aOobzPV",
          height: "380",
          width: "300",
        },
      ],
      [
        "https://open.spotify.com/artist/6sFIWsNpZYqfjUpaCgueju?si=xxxxxxxxxxxxxxx",
        {
          url: "https://open.spotify.com/embed/artist/6sFIWsNpZYqfjUpaCgueju",
          height: "380",
          width: "300",
        },
      ],
      [
        "https://open.spotify.com/embed/artist/6sFIWsNpZYqfjUpaCgueju?si=xxxxxxxxxxxxxxx",
        {
          url: "https://open.spotify.com/embed/artist/6sFIWsNpZYqfjUpaCgueju",
          height: "380",
          width: "300",
        },
      ],
      [
        "https://open.spotify.com/playlist/2s1HL7UaXEPWqJR4E1Gt1A?si=xxxxxxxxxxxxxxx",
        {
          url: "https://open.spotify.com/embed/playlist/2s1HL7UaXEPWqJR4E1Gt1A",
          height: "380",
          width: "300",
        },
      ],
      [
        "https://open.spotify.com/embed/playlist/2s1HL7UaXEPWqJR4E1Gt1A?si=xxxxxxxxxxxxxxx",
        {
          url: "https://open.spotify.com/embed/playlist/2s1HL7UaXEPWqJR4E1Gt1A",
          height: "380",
          width: "300",
        },
      ],
    ])("%s", (url, attributes) => {
      let doc = URLSource.fromRaw(url).convertTo(OffsetSource);
      expect(serialize(doc, { withStableIds: true })).toEqual({
        text: "\uFFFC",
        blocks: [
          {
            id: "B00000000",
            parents: [],
            selfClosing: false,
            type: "iframe-embed",
            attributes,
          },
        ],
        marks: [],
      });
    });
  });
  describe("reddit", () => {
    test.each([
      [
        "https://www.reddit.com/r/pics/comments/r9p0tp/my_great_grandfather_killed_a_nazi_and_took_this/?utm_source=share&utm_medium=web2x&context=3",
        {
          url: "https://www.redditmedia.com/r/pics/comments/r9p0tp/my_great_grandfather_killed_a_nazi_and_took_this/?ref_source=embed&ref=share&embed=true&showmedia=false",
          height: "141",
          width: "640",
          sandbox: "allow-scripts allow-same-origin allow-popups",
        },
      ],
      [
        "https://www.reddit.com/r/CryptoCurrency/comments/r9fni8/tether_usdt_created_1500000000_worth_of_usdt_out/?utm_source=share&utm_medium=web2x&context=3",
        {
          url: "https://www.redditmedia.com/r/CryptoCurrency/comments/r9fni8/tether_usdt_created_1500000000_worth_of_usdt_out/?ref_source=embed&ref=share&embed=true&showmedia=false",
          height: "141",
          width: "640",
          sandbox: "allow-scripts allow-same-origin allow-popups",
        },
      ],
    ])("%s", (url, attributes) => {
      let doc = URLSource.fromRaw(url).convertTo(OffsetSource);
      expect(serialize(doc, { withStableIds: true })).toEqual({
        text: "\uFFFC",
        blocks: [
          {
            id: "B00000000",
            parents: [],
            selfClosing: false,
            type: "iframe-embed",
            attributes,
          },
        ],
        marks: [],
      });
    });
  });
});
