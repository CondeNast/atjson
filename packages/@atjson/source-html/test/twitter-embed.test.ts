import HTMLSource from "../src";
import OffsetSource from "@atjson/offset-annotations";
import { serialize } from "@atjson/document";

describe("TwitterEmbed (x.com / twitter.com)", () => {
  test("embed", () => {
    let doc = HTMLSource.fromRaw(
      `<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Respect the drip, twerp. <a href="https://t.co/f5OF4ikSFj">pic.twitter.com/f5OF4ikSFj</a></p>&mdash; Pokémon (@Pokemon) <a href="https://twitter.com/Pokemon/status/1227294189185949696?ref_src=twsrc%5Etfw">February 11, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`,
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {
              "content": "M00000000",
              "url": "https://twitter.com/Pokemon/status/1227294189185949696",
            },
            "id": "B00000000",
            "parents": [],
            "selfClosing": false,
            "type": "twitter-embed",
          },
          {
            "attributes": {},
            "id": "B00000001",
            "parents": [
              "twitter-embed",
            ],
            "selfClosing": false,
            "type": "text",
          },
          {
            "attributes": {},
            "id": "B00000002",
            "parents": [
              "twitter-embed",
              "text",
            ],
            "selfClosing": true,
            "type": "line-break",
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
            "range": "(1..92]",
            "type": "slice",
          },
          {
            "attributes": {
              "url": "https://t.co/f5OF4ikSFj",
            },
            "id": "M00000001",
            "range": "(27..53)",
            "type": "link",
          },
          {
            "attributes": {
              "url": "https://twitter.com/Pokemon/status/1227294189185949696?ref_src=twsrc^tfw",
            },
            "id": "M00000002",
            "range": "(75..92)",
            "type": "link",
          },
        ],
        "text": "￼￼Respect the drip, twerp. pic.twitter.com/f5OF4ikSFj￼— Pokémon (@Pokemon) February 11, 2020",
      }
    `);
  });
});
