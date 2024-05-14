import { serialize } from "@atjson/document";
import OffsetSource from "@atjson/offset-annotations";
import HTMLSource from "../src";

describe("RedditEmbed", () => {
  test("uncustomized", () => {
    let doc = HTMLSource.fromRaw(
      `<blockquote class="reddit-embed-bq" style="height:500px" data-embed-height="546"><a href="https://www.reddit.com/r/Eldenring/comments/tusanf/dude_just_slap_me_and_left/">dude just slap me and left</a><br> by<a href="https://www.reddit.com/user/the_ginger_one367/">u/the_ginger_one367</a> in<a href="https://www.reddit.com/r/Eldenring/">Eldenring</a></blockquote><script async="" src="https://embed.reddit.com/widgets.js" charset="UTF-8"></script>`
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {
              "content": "B00000000",
              "height": 546,
              "hidePostContent": false,
              "hideUsername": false,
              "url": "https://www.reddit.com/r/Eldenring/comments/tusanf/dude_just_slap_me_and_left/",
            },
            "id": "B00000000",
            "parents": [],
            "selfClosing": false,
            "type": "reddit-embed",
          },
          {
            "attributes": {},
            "id": "B00000001",
            "parents": [
              "reddit-embed",
            ],
            "selfClosing": true,
            "type": "line-break",
          },
        ],
        "marks": [
          {
            "attributes": {
              "url": "https://www.reddit.com/r/Eldenring/comments/tusanf/dude_just_slap_me_and_left/",
            },
            "id": "M00000000",
            "range": "(1..27)",
            "type": "link",
          },
          {
            "attributes": {
              "refs": [
                "B00000000",
              ],
            },
            "id": "M00000001",
            "range": "(1..62]",
            "type": "slice",
          },
          {
            "attributes": {
              "url": "https://www.reddit.com/user/the_ginger_one367/",
            },
            "id": "M00000002",
            "range": "(31..50)",
            "type": "link",
          },
          {
            "attributes": {
              "url": "https://www.reddit.com/r/Eldenring/",
            },
            "id": "M00000003",
            "range": "(53..62)",
            "type": "link",
          },
        ],
        "text": "￼dude just slap me and left￼ byu/the_ginger_one367 inEldenring",
      }
    `);
  });

  test("hidePostContent", () => {
    let doc = HTMLSource.fromRaw(
      `<blockquote class="reddit-embed-bq" style="height:500px" data-embed-showmedia="false" data-embed-height="240"><a href="https://www.reddit.com/r/Eldenring/comments/tusanf/dude_just_slap_me_and_left/">dude just slap me and left</a><br> by<a href="https://www.reddit.com/user/the_ginger_one367/">u/the_ginger_one367</a> in<a href="https://www.reddit.com/r/Eldenring/">Eldenring</a></blockquote><script async="" src="https://embed.reddit.com/widgets.js" charset="UTF-8"></script>`
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {
              "content": "B00000000",
              "height": 240,
              "hidePostContent": true,
              "hideUsername": false,
              "url": "https://www.reddit.com/r/Eldenring/comments/tusanf/dude_just_slap_me_and_left/",
            },
            "id": "B00000000",
            "parents": [],
            "selfClosing": false,
            "type": "reddit-embed",
          },
          {
            "attributes": {},
            "id": "B00000001",
            "parents": [
              "reddit-embed",
            ],
            "selfClosing": true,
            "type": "line-break",
          },
        ],
        "marks": [
          {
            "attributes": {
              "url": "https://www.reddit.com/r/Eldenring/comments/tusanf/dude_just_slap_me_and_left/",
            },
            "id": "M00000000",
            "range": "(1..27)",
            "type": "link",
          },
          {
            "attributes": {
              "refs": [
                "B00000000",
              ],
            },
            "id": "M00000001",
            "range": "(1..62]",
            "type": "slice",
          },
          {
            "attributes": {
              "url": "https://www.reddit.com/user/the_ginger_one367/",
            },
            "id": "M00000002",
            "range": "(31..50)",
            "type": "link",
          },
          {
            "attributes": {
              "url": "https://www.reddit.com/r/Eldenring/",
            },
            "id": "M00000003",
            "range": "(53..62)",
            "type": "link",
          },
        ],
        "text": "￼dude just slap me and left￼ byu/the_ginger_one367 inEldenring",
      }
    `);
  });

  test("hideUsername", () => {
    let doc = HTMLSource.fromRaw(
      `<blockquote class="reddit-embed-bq" style="height:500px" data-embed-showusername="false" data-embed-height="546"><a href="https://www.reddit.com/r/Eldenring/comments/tusanf/dude_just_slap_me_and_left/">dude just slap me and left</a><br> by<a href="https://www.reddit.com/user/the_ginger_one367/">u/the_ginger_one367</a> in<a href="https://www.reddit.com/r/Eldenring/">Eldenring</a></blockquote><script async="" src="https://embed.reddit.com/widgets.js" charset="UTF-8"></script>`
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {
              "content": "B00000000",
              "height": 546,
              "hidePostContent": false,
              "hideUsername": true,
              "url": "https://www.reddit.com/r/Eldenring/comments/tusanf/dude_just_slap_me_and_left/",
            },
            "id": "B00000000",
            "parents": [],
            "selfClosing": false,
            "type": "reddit-embed",
          },
          {
            "attributes": {},
            "id": "B00000001",
            "parents": [
              "reddit-embed",
            ],
            "selfClosing": true,
            "type": "line-break",
          },
        ],
        "marks": [
          {
            "attributes": {
              "url": "https://www.reddit.com/r/Eldenring/comments/tusanf/dude_just_slap_me_and_left/",
            },
            "id": "M00000000",
            "range": "(1..27)",
            "type": "link",
          },
          {
            "attributes": {
              "refs": [
                "B00000000",
              ],
            },
            "id": "M00000001",
            "range": "(1..62]",
            "type": "slice",
          },
          {
            "attributes": {
              "url": "https://www.reddit.com/user/the_ginger_one367/",
            },
            "id": "M00000002",
            "range": "(31..50)",
            "type": "link",
          },
          {
            "attributes": {
              "url": "https://www.reddit.com/r/Eldenring/",
            },
            "id": "M00000003",
            "range": "(53..62)",
            "type": "link",
          },
        ],
        "text": "￼dude just slap me and left￼ byu/the_ginger_one367 inEldenring",
      }
    `);
  });

  test("hidePostContentIfEditedAfter", () => {
    let doc = HTMLSource.fromRaw(
      `<blockquote class="reddit-embed-bq" style="height:500px" data-embed-showedits="false" data-embed-created="2024-05-01T19:46:02.207Z" data-embed-height="546"><a href="https://www.reddit.com/r/Eldenring/comments/tusanf/dude_just_slap_me_and_left/">dude just slap me and left</a><br> by<a href="https://www.reddit.com/user/the_ginger_one367/">u/the_ginger_one367</a> in<a href="https://www.reddit.com/r/Eldenring/">Eldenring</a></blockquote><script async="" src="https://embed.reddit.com/widgets.js" charset="UTF-8"></script>`
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {
              "content": "B00000000",
              "height": 546,
              "hidePostContent": false,
              "hidePostContentIfEditedAfter": "2024-05-01T19:46:02.207Z",
              "hideUsername": false,
              "url": "https://www.reddit.com/r/Eldenring/comments/tusanf/dude_just_slap_me_and_left/",
            },
            "id": "B00000000",
            "parents": [],
            "selfClosing": false,
            "type": "reddit-embed",
          },
          {
            "attributes": {},
            "id": "B00000001",
            "parents": [
              "reddit-embed",
            ],
            "selfClosing": true,
            "type": "line-break",
          },
        ],
        "marks": [
          {
            "attributes": {
              "url": "https://www.reddit.com/r/Eldenring/comments/tusanf/dude_just_slap_me_and_left/",
            },
            "id": "M00000000",
            "range": "(1..27)",
            "type": "link",
          },
          {
            "attributes": {
              "refs": [
                "B00000000",
              ],
            },
            "id": "M00000001",
            "range": "(1..62]",
            "type": "slice",
          },
          {
            "attributes": {
              "url": "https://www.reddit.com/user/the_ginger_one367/",
            },
            "id": "M00000002",
            "range": "(31..50)",
            "type": "link",
          },
          {
            "attributes": {
              "url": "https://www.reddit.com/r/Eldenring/",
            },
            "id": "M00000003",
            "range": "(53..62)",
            "type": "link",
          },
        ],
        "text": "￼dude just slap me and left￼ byu/the_ginger_one367 inEldenring",
      }
    `);
  });
});
