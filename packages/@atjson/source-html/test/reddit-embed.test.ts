import { serialize } from "@atjson/document";
import OffsetSource from "@atjson/offset-annotations";
import HTMLSource from "../src";

describe("RedditEmbed", () => {
  test("uncustomized", () => {
    let doc = HTMLSource.fromRaw(
      `<blockquote class="reddit-embed-bq" style="height:500px" data-embed-height="740"><a href="https://www.reddit.com/r/cats/comments/1cretsi/made_this_mistake_need_help_with_names/">Made this mistake. Need help with names.</a><br> by<a href="https://www.reddit.com/user/niccia/">u/niccia</a> in<a href="https://www.reddit.com/r/cats/">cats</a></blockquote><script async="" src="https://embed.reddit.com/widgets.js" charset="UTF-8"></script>`
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {
              "content": "M00000000",
              "height": 740,
              "hidePostContent": false,
              "hideUsername": false,
              "url": "https://www.reddit.com/r/cats/comments/1cretsi/made_this_mistake_need_help_with_names/",
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
            "selfClosing": false,
            "type": "text",
          },
          {
            "attributes": {},
            "id": "B00000002",
            "parents": [
              "reddit-embed",
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
            "range": "(1..63]",
            "type": "slice",
          },
          {
            "attributes": {
              "url": "https://www.reddit.com/r/cats/comments/1cretsi/made_this_mistake_need_help_with_names/",
            },
            "id": "M00000001",
            "range": "(2..42)",
            "type": "link",
          },
          {
            "attributes": {
              "url": "https://www.reddit.com/user/niccia/",
            },
            "id": "M00000002",
            "range": "(47..55)",
            "type": "link",
          },
          {
            "attributes": {
              "url": "https://www.reddit.com/r/cats/",
            },
            "id": "M00000003",
            "range": "(59..63)",
            "type": "link",
          },
        ],
        "text": "￼￼Made this mistake. Need help with names.￼ by u/niccia in cats",
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
              "content": "M00000000",
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
            "selfClosing": false,
            "type": "text",
          },
          {
            "attributes": {},
            "id": "B00000002",
            "parents": [
              "reddit-embed",
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
            "range": "(1..65]",
            "type": "slice",
          },
          {
            "attributes": {
              "url": "https://www.reddit.com/r/Eldenring/comments/tusanf/dude_just_slap_me_and_left/",
            },
            "id": "M00000001",
            "range": "(2..28)",
            "type": "link",
          },
          {
            "attributes": {
              "url": "https://www.reddit.com/user/the_ginger_one367/",
            },
            "id": "M00000002",
            "range": "(33..52)",
            "type": "link",
          },
          {
            "attributes": {
              "url": "https://www.reddit.com/r/Eldenring/",
            },
            "id": "M00000003",
            "range": "(56..65)",
            "type": "link",
          },
        ],
        "text": "￼￼dude just slap me and left￼ by u/the_ginger_one367 in Eldenring",
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
              "content": "M00000000",
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
            "selfClosing": false,
            "type": "text",
          },
          {
            "attributes": {},
            "id": "B00000002",
            "parents": [
              "reddit-embed",
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
            "range": "(1..65]",
            "type": "slice",
          },
          {
            "attributes": {
              "url": "https://www.reddit.com/r/Eldenring/comments/tusanf/dude_just_slap_me_and_left/",
            },
            "id": "M00000001",
            "range": "(2..28)",
            "type": "link",
          },
          {
            "attributes": {
              "url": "https://www.reddit.com/user/the_ginger_one367/",
            },
            "id": "M00000002",
            "range": "(33..52)",
            "type": "link",
          },
          {
            "attributes": {
              "url": "https://www.reddit.com/r/Eldenring/",
            },
            "id": "M00000003",
            "range": "(56..65)",
            "type": "link",
          },
        ],
        "text": "￼￼dude just slap me and left￼ by u/the_ginger_one367 in Eldenring",
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
              "content": "M00000000",
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
            "selfClosing": false,
            "type": "text",
          },
          {
            "attributes": {},
            "id": "B00000002",
            "parents": [
              "reddit-embed",
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
            "range": "(1..65]",
            "type": "slice",
          },
          {
            "attributes": {
              "url": "https://www.reddit.com/r/Eldenring/comments/tusanf/dude_just_slap_me_and_left/",
            },
            "id": "M00000001",
            "range": "(2..28)",
            "type": "link",
          },
          {
            "attributes": {
              "url": "https://www.reddit.com/user/the_ginger_one367/",
            },
            "id": "M00000002",
            "range": "(33..52)",
            "type": "link",
          },
          {
            "attributes": {
              "url": "https://www.reddit.com/r/Eldenring/",
            },
            "id": "M00000003",
            "range": "(56..65)",
            "type": "link",
          },
        ],
        "text": "￼￼dude just slap me and left￼ by u/the_ginger_one367 in Eldenring",
      }
    `);
  });
});
