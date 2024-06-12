import HTMLSource from "../src";
import OffsetSource from "@atjson/offset-annotations";
import { serialize } from "@atjson/document";

describe("IframeEmbed", () => {
  test("protocol-relative", () => {
    let doc = HTMLSource.fromRaw(
      `<iframe src="//example.com"
        scrolling="no" frameborder="0"
        allowTransparency="true" allow="encrypted-media"></iframe>`
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {
              "url": "//example.com",
            },
            "id": "B00000000",
            "parents": [],
            "selfClosing": false,
            "type": "iframe-embed",
          },
        ],
        "marks": [],
        "text": "￼",
      }
    `);
  });

  test("sandbox", () => {
    let doc = HTMLSource.fromRaw(
      `<iframe src="https://example.com"
        scrolling="no" frameborder="0"
        allowTransparency="true" allow="encrypted-media" sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms"></iframe>`
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {
              "sandbox": "allow-same-origin,allow-scripts,allow-popups,allow-popups-to-escape-sandbox,allow-forms",
              "url": "https://example.com",
            },
            "id": "B00000000",
            "parents": [],
            "selfClosing": false,
            "type": "iframe-embed",
          },
        ],
        "marks": [],
        "text": "￼",
      }
    `);
  });

  describe("Spotify", () => {
    test("podcast show embed", () => {
      let doc = HTMLSource.fromRaw(
        `<iframe src="https://open.spotify.com/embed-podcast/show/1iohmBNlRooIVtukKeavRa"
          width="100%"
          height="232"
          frameborder="0"
          allowtransparency="true"
          allow="encrypted-media"></iframe>`
      ).convertTo(OffsetSource);

      expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
        {
          "blocks": [
            {
              "attributes": {
                "height": "232",
                "url": "https://open.spotify.com/embed-podcast/show/1iohmBNlRooIVtukKeavRa",
                "width": "100%",
              },
              "id": "B00000000",
              "parents": [],
              "selfClosing": false,
              "type": "iframe-embed",
            },
          ],
          "marks": [],
          "text": "￼",
        }
      `);
    });

    test("track embed", () => {
      let doc = HTMLSource.fromRaw(
        `<iframe src="https://open.spotify.com/embed/track/1QY4TdhuNIOX2SHLdElzd5"
          width="300"
          height="380"
          frameborder="0"
          allowtransparency="true"
          allow="encrypted-media"></iframe>`
      ).convertTo(OffsetSource);

      expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
        {
          "blocks": [
            {
              "attributes": {
                "height": "380",
                "url": "https://open.spotify.com/embed/track/1QY4TdhuNIOX2SHLdElzd5",
                "width": "300",
              },
              "id": "B00000000",
              "parents": [],
              "selfClosing": false,
              "type": "iframe-embed",
            },
          ],
          "marks": [],
          "text": "￼",
        }
      `);
    });
  });
});
