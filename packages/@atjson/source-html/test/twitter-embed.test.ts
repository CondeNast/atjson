import HTMLSource from "../src";
import OffsetSource from "@atjson/offset-annotations";
import { serialize } from "@atjson/document";

describe("TwitterEmbed (x.com / twitter.com)", () => {
  test("embed", () => {
    let doc = HTMLSource.fromRaw(
      `<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Hope you had a great start to your week, New York City! <a href="https://t.co/9skas4Bady">pic.twitter.com/9skas4Bady</a></p>&mdash; City of New York (@nycgov) <a href="https://twitter.com/nycgov/status/1191528054608334848?ref_src=twsrc%5Etfw">November 5, 2019</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {
              "content": "M00000000",
              "url": "https://twitter.com/nycgov/status/1191528054608334848",
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
            "type": "paragraph",
          },
          {
            "attributes": {},
            "id": "B00000002",
            "parents": [
              "twitter-embed",
            ],
            "selfClosing": false,
            "type": "text",
          },
          {
            "attributes": {},
            "id": "B00000003",
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
            "range": "(1..130]",
            "type": "slice",
          },
          {
            "attributes": {
              "url": "https://t.co/9skas4Bady",
            },
            "id": "M00000001",
            "range": "(58..84)",
            "type": "link",
          },
          {
            "attributes": {
              "url": "https://twitter.com/nycgov/status/1191528054608334848?ref_src=twsrc^tfw",
            },
            "id": "M00000002",
            "range": "(114..130)",
            "type": "link",
          },
        ],
        "text": "￼￼Hope you had a great start to your week, New York City! pic.twitter.com/9skas4Bady￼— City of New York (@nycgov) November 5, 2019￼ ",
      }
    `);
  });
});
