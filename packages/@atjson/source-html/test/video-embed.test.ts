import HTMLSource from "../src";
import OffsetSource, { VideoURLs } from "@atjson/offset-annotations";
import { serialize } from "@atjson/document";

describe("VideoEmbed", () => {
  describe("YouTube", () => {
    test.each([
      ["https://www.youtube.com/embed/0-jus6AGHzQ"],
      ["https://www.youtube-nocookie.com/embed/0-jus6AGHzQ?controls=0"],
      ["//www.youtube-nocookie.com/embed/0-jus6AGHzQ?controls=0"],
    ])("%s", (url) => {
      let doc = HTMLSource.fromRaw(
        `<iframe width="560" height="315"
            src="${url}"
            frameborder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen></iframe>`,
      ).convertTo(OffsetSource);

      if (url.startsWith("//")) {
        url = `https:${url}`;
      }
      expect(serialize(doc)).toMatchObject({
        text: "\uFFFC",
        blocks: [
          {
            type: "video-embed",
            attributes: {
              url,
              provider: VideoURLs.Provider.YOUTUBE,
              width: 560,
              height: 315,
              aspectRatio: "16:9",
            },
            parents: [],
          },
        ],
      });
    });
  });

  describe("Vimeo", () => {
    test("default embed code (with caption)", () => {
      let html = `<iframe src="https://player.vimeo.com/video/156254412" width="640" height="480" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe><p><a href="https://vimeo.com/156254412">TSVETOK - Vogue Italia</a> from <a href="https://vimeo.com/karimandreotti">Karim Andreotti</a> on <a href="https://vimeo.com">Vimeo</a>.</p>`;
      let doc = HTMLSource.fromRaw(html).convertTo(OffsetSource);

      expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
        {
          "blocks": [
            {
              "attributes": {
                "aspectRatio": "4:3",
                "caption": "M00000000",
                "height": 480,
                "provider": "VIMEO",
                "url": "https://player.vimeo.com/video/156254412",
                "width": 640,
              },
              "id": "B00000000",
              "parents": [],
              "selfClosing": false,
              "type": "video-embed",
            },
            {
              "attributes": {},
              "id": "B00000001",
              "parents": [],
              "selfClosing": false,
              "type": "text",
            },
          ],
          "marks": [
            {
              "attributes": {
                "refs": [
                  "B00000000",
                ],
              },
              "id": "M00000000",
              "range": "(1..55]",
              "type": "slice",
            },
            {
              "attributes": {
                "url": "https://vimeo.com/156254412",
              },
              "id": "M00000001",
              "range": "(2..24)",
              "type": "link",
            },
            {
              "attributes": {
                "url": "https://vimeo.com/karimandreotti",
              },
              "id": "M00000002",
              "range": "(30..45)",
              "type": "link",
            },
            {
              "attributes": {
                "url": "https://vimeo.com",
              },
              "id": "M00000003",
              "range": "(49..54)",
              "type": "link",
            },
          ],
          "text": "￼￼TSVETOK - Vogue Italia from Karim Andreotti on Vimeo.",
        }
      `);
    });

    test("protocol-relative URLs https", () => {
      let doc = HTMLSource.fromRaw(
        `<iframe src="//player.vimeo.com/video/156254412" width="640" height="480" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`,
      ).convertTo(OffsetSource);

      expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
        {
          "blocks": [
            {
              "attributes": {
                "aspectRatio": "4:3",
                "height": 480,
                "provider": "VIMEO",
                "url": "https://player.vimeo.com/video/156254412",
                "width": 640,
              },
              "id": "B00000000",
              "parents": [],
              "selfClosing": false,
              "type": "video-embed",
            },
          ],
          "marks": [],
          "text": "￼",
        }
      `);
    });

    test("embed code with trailing paragraph that isn't from Vimeo", () => {
      let doc = HTMLSource.fromRaw(
        `<iframe src="https://player.vimeo.com/video/156254412" width="640" height="480" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>
<p>Hello, this is something from <a href="https://vogue.it">Vogue Italia</a>!</p>`,
      ).convertTo(OffsetSource);

      expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
        {
          "blocks": [
            {
              "attributes": {
                "aspectRatio": "4:3",
                "height": 480,
                "provider": "VIMEO",
                "url": "https://player.vimeo.com/video/156254412",
                "width": 640,
              },
              "id": "B00000000",
              "parents": [],
              "selfClosing": false,
              "type": "video-embed",
            },
            {
              "attributes": {},
              "id": "B00000001",
              "parents": [],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B00000002",
              "parents": [],
              "selfClosing": false,
              "type": "paragraph",
            },
          ],
          "marks": [
            {
              "attributes": {
                "url": "https://vogue.it",
              },
              "id": "M00000000",
              "range": "(34..46)",
              "type": "link",
            },
          ],
          "text": "￼￼
        ￼Hello, this is something from Vogue Italia!",
        }
      `);
    });

    test("embed code without caption", () => {
      let doc = HTMLSource.fromRaw(
        `<iframe src="https://player.vimeo.com/video/156254412" width="640" height="480" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`,
      ).convertTo(OffsetSource);

      expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
        {
          "blocks": [
            {
              "attributes": {
                "aspectRatio": "4:3",
                "height": 480,
                "provider": "VIMEO",
                "url": "https://player.vimeo.com/video/156254412",
                "width": 640,
              },
              "id": "B00000000",
              "parents": [],
              "selfClosing": false,
              "type": "video-embed",
            },
          ],
          "marks": [],
          "text": "￼",
        }
      `);
    });
  });

  test("Dailymotion", () => {
    let doc = HTMLSource.fromRaw(
      `<iframe frameborder="0" width="480" height="270" src="https://www.dailymotion.com/embed/video/x6gmvnp" allowfullscreen allow="autoplay"></iframe>`,
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {
              "aspectRatio": "16:9",
              "height": 270,
              "provider": "DAILYMOTION",
              "url": "https://www.dailymotion.com/embed/video/x6gmvnp",
              "width": 480,
            },
            "id": "B00000000",
            "parents": [],
            "selfClosing": false,
            "type": "video-embed",
          },
        ],
        "marks": [],
        "text": "￼",
      }
    `);
  });

  test("Brightcove", () => {
    let doc = HTMLSource.fromRaw(
      `<div style="position: relative; display: block; max-width: 640px;">
  <div style="padding-top: 56.25%;">
    <iframe src="https://players.brightcove.net/1752604059001/default_default/index.html?videoId=5802784116001"
      allowfullscreen
      webkitallowfullscreen
      mozallowfullscreen
      style="position: absolute; top: 0px; right: 0px; bottom: 0px; left: 0px; width: 100%; height: 100%;">
    </iframe>
  </div>
</div>`,
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {},
            "id": "B00000000",
            "parents": [],
            "selfClosing": false,
            "type": "text",
          },
          {
            "attributes": {
              "aspectRatio": "16:9",
              "height": 360,
              "provider": "BRIGHTCOVE",
              "url": "https://players.brightcove.net/1752604059001/default_default/index.html?videoId=5802784116001",
              "width": 640,
            },
            "id": "B00000001",
            "parents": [],
            "selfClosing": false,
            "type": "video-embed",
          },
          {
            "attributes": {},
            "id": "B00000002",
            "parents": [],
            "selfClosing": false,
            "type": "text",
          },
        ],
        "marks": [],
        "text": "￼
        
          ￼
          ￼
        
      ",
      }
    `);
  });

  test("Twitch videos", () => {
    let doc = HTMLSource.fromRaw(
      `<iframe src="https://player.twitch.tv/?video=956002196&parent=www.example.com" frameborder="0" allowfullscreen="true" scrolling="no" height="378" width="620"></iframe>`,
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {
              "aspectRatio": "5:3",
              "height": 378,
              "provider": "TWITCH",
              "url": "https://player.twitch.tv/?video=956002196&parent=www.example.com",
              "width": 620,
            },
            "id": "B00000000",
            "parents": [],
            "selfClosing": false,
            "type": "video-embed",
          },
        ],
        "marks": [],
        "text": "￼",
      }
    `);
  });

  test("Twitch clips", () => {
    let doc = HTMLSource.fromRaw(
      `<iframe src="https://clips.twitch.tv/embed?clip=StrongBlueWaterDoubleRainbow&parent=www.example.com" frameborder="0" allowfullscreen="true" scrolling="no" height="378" width="620"></iframe>`,
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {
              "aspectRatio": "5:3",
              "height": 378,
              "provider": "TWITCH",
              "url": "https://clips.twitch.tv/embed?clip=StrongBlueWaterDoubleRainbow&parent=www.example.com",
              "width": 620,
            },
            "id": "B00000000",
            "parents": [],
            "selfClosing": false,
            "type": "video-embed",
          },
        ],
        "marks": [],
        "text": "￼",
      }
    `);
  });

  test("Wirewax", () => {
    let doc = HTMLSource.fromRaw(
      `<iframe style="position: absolute; top: 0; left: 0;" width="100%" height="100%" src="https://embedder.wirewax.com/8203724/" frameborder="0" scrolling="yes" allowfullscreen></iframe>`,
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {
              "aspectRatio": "1:1",
              "height": 100,
              "provider": "WIREWAX",
              "url": "https://embedder.wirewax.com/8203724",
              "width": 100,
            },
            "id": "B00000000",
            "parents": [],
            "selfClosing": false,
            "type": "video-embed",
          },
        ],
        "marks": [],
        "text": "￼",
      }
    `);
  });
});
