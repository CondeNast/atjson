import OffsetSource from "@atjson/offset-annotations";
import HTMLSource from "../src";
import { serialize } from "@atjson/document";

describe("BlueskyEmbed", () => {
  test("default", () => {
    let doc = HTMLSource.fromRaw(
      '<blockquote class="bluesky-embed" data-bluesky-uri="at://did:plc:xrr5j2okn7ew2zvcwsxus3gb/app.bsky.feed.post/3kshwuxmy5o2y" data-bluesky-cid="bafyreicg7axsdp6b7f4uj75ggdfhrdl52cqpjah45scox3prmqflwg557i"><p lang="en">Lap time al fresco. Photo from my collection, no date/info.<br><br><a href="https://bsky.app/profile/did:plc:xrr5j2okn7ew2zvcwsxus3gb/post/3kshwuxmy5o2y?ref_src=embed">[image or embed]</a></p>&mdash; Cats of Yore (<a href="https://bsky.app/profile/did:plc:xrr5j2okn7ew2zvcwsxus3gb?ref_src=embed">@catsofyore.bsky.social</a>) <a href="https://bsky.app/profile/did:plc:xrr5j2okn7ew2zvcwsxus3gb/post/3kshwuxmy5o2y?ref_src=embed">May 14, 2024 at 3:43 PM</a></blockquote><script async src="https://embed.bsky.app/static/embed.js" charset="utf-8"></script>'
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {
              "cid": "bafyreicg7axsdp6b7f4uj75ggdfhrdl52cqpjah45scox3prmqflwg557i",
              "content": "M00000000",
              "uri": "at://did:plc:xrr5j2okn7ew2zvcwsxus3gb/app.bsky.feed.post/3kshwuxmy5o2y",
              "url": "https://bsky.app/profile/did:plc:xrr5j2okn7ew2zvcwsxus3gb/post/3kshwuxmy5o2y",
            },
            "id": "B00000000",
            "parents": [],
            "selfClosing": false,
            "type": "bluesky-embed",
          },
          {
            "attributes": {},
            "id": "B00000001",
            "parents": [
              "bluesky-embed",
            ],
            "selfClosing": false,
            "type": "text",
          },
          {
            "attributes": {},
            "id": "B00000002",
            "parents": [
              "bluesky-embed",
              "text",
            ],
            "selfClosing": true,
            "type": "line-break",
          },
          {
            "attributes": {},
            "id": "B00000003",
            "parents": [
              "bluesky-embed",
              "text",
            ],
            "selfClosing": true,
            "type": "line-break",
          },
          {
            "attributes": {},
            "id": "B00000004",
            "parents": [
              "bluesky-embed",
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
            "range": "(1..144]",
            "type": "slice",
          },
          {
            "attributes": {
              "url": "https://bsky.app/profile/did:plc:xrr5j2okn7ew2zvcwsxus3gb/post/3kshwuxmy5o2y?ref_src=embed",
            },
            "id": "M00000001",
            "range": "(63..79)",
            "type": "link",
          },
          {
            "attributes": {
              "url": "https://bsky.app/profile/did:plc:xrr5j2okn7ew2zvcwsxus3gb?ref_src=embed",
            },
            "id": "M00000002",
            "range": "(96..119)",
            "type": "link",
          },
          {
            "attributes": {
              "url": "https://bsky.app/profile/did:plc:xrr5j2okn7ew2zvcwsxus3gb/post/3kshwuxmy5o2y?ref_src=embed",
            },
            "id": "M00000003",
            "range": "(121..144)",
            "type": "link",
          },
        ],
        "text": "￼￼Lap time al fresco. Photo from my collection, no date/info.￼￼[image or embed]￼— Cats of Yore (@catsofyore.bsky.social) May 14, 2024 at 3:43 PM",
      }
    `);
  });
});
