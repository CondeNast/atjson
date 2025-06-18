import HTMLSource from "../src";
import OffsetSource from "@atjson/offset-annotations";
import { serialize } from "@atjson/document";

describe("FacebookEmbed", () => {
  test("iframe embed", () => {
    let doc = HTMLSource.fromRaw(
      `<iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2FBeethovenOfficialPage%2Fposts%2F2923157684380743&width=500"
        width="500" height="633"
        style="border:none;overflow:hidden"
        scrolling="no" frameborder="0"
        allowTransparency="true" allow="encrypted-media"></iframe>`,
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {
              "height": "633",
              "url": "https://www.facebook.com/BeethovenOfficialPage/posts/2923157684380743",
              "width": "500",
            },
            "id": "B00000000",
            "parents": [],
            "selfClosing": false,
            "type": "facebook-embed",
          },
        ],
        "marks": [],
        "text": "￼",
      }
    `);
  });

  test("div embed", () => {
    let doc = HTMLSource.fromRaw(
      `<div class="fb-post" data-href="https://www.facebook.com/BeethovenOfficialPage/posts/2923157684380743" data-width="500" data-show-text="true"><blockquote cite="https://developers.facebook.com/BeethovenOfficialPage/posts/2923157684380743" class="fb-xfbml-parse-ignore"><p>Next stop of the exhibition &quot;BTHVN on Tour&quot; is in Boston!</p>Posted by <a href="https://www.facebook.com/BeethovenOfficialPage/">Ludwig van Beethoven</a> on&nbsp;<a href="https://developers.facebook.com/BeethovenOfficialPage/posts/2923157684380743">Thursday, October 24, 2019</a></blockquote></div>`,
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {
              "content": "M00000000",
              "hideText": false,
              "url": "https://www.facebook.com/BeethovenOfficialPage/posts/2923157684380743",
            },
            "id": "B00000000",
            "parents": [],
            "selfClosing": false,
            "type": "facebook-embed",
          },
          {
            "attributes": {},
            "id": "B00000001",
            "parents": [
              "facebook-embed",
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
            "range": "(1..119]",
            "type": "slice",
          },
          {
            "attributes": {
              "url": "https://www.facebook.com/BeethovenOfficialPage/",
            },
            "id": "M00000001",
            "range": "(69..89)",
            "type": "link",
          },
          {
            "attributes": {
              "url": "https://developers.facebook.com/BeethovenOfficialPage/posts/2923157684380743",
            },
            "id": "M00000002",
            "range": "(93..119)",
            "type": "link",
          },
        ],
        "text": "￼Next stop of the exhibition "BTHVN on Tour" is in Boston!￼Posted by Ludwig van Beethoven on\u00a0Thursday, October 24, 2019",
      }
    `);
  });
});
