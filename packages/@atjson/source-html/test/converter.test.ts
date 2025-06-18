import { serialize } from "@atjson/document";
import OffsetSource from "@atjson/offset-annotations";
import HTMLSource from "../src";

describe("@atjson/source-html", () => {
  describe("converter", () => {
    test("p, br", () => {
      let doc = HTMLSource.fromRaw(
        "<p>This paragraph has a<br>line break</p>",
      ).convertTo(OffsetSource);
      expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
        {
          "blocks": [
            {
              "attributes": {},
              "id": "B00000000",
              "parents": [],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B00000001",
              "parents": [
                "paragraph",
              ],
              "selfClosing": true,
              "type": "line-break",
            },
          ],
          "marks": [],
          "text": "￼This paragraph has a￼line break",
        }
      `);
    });

    test("a", () => {
      let doc = HTMLSource.fromRaw(
        'This <a href="https://condenast.com" rel="nofollow" target="_blank" title="Condé Nast">is a link</a>',
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
          ],
          "marks": [
            {
              "attributes": {
                "rel": "nofollow",
                "target": "_blank",
                "title": "Condé Nast",
                "url": "https://condenast.com",
              },
              "id": "M00000000",
              "range": "(6..15)",
              "type": "link",
            },
          ],
          "text": "￼This is a link",
        }
      `);
    });

    test("hr", () => {
      let doc = HTMLSource.fromRaw(
        "<p>Horizontal</p><hr><p>rules!</p>",
      ).convertTo(OffsetSource);
      expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
        {
          "blocks": [
            {
              "attributes": {},
              "id": "B00000000",
              "parents": [],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B00000001",
              "parents": [],
              "selfClosing": false,
              "type": "horizontal-rule",
            },
            {
              "attributes": {},
              "id": "B00000002",
              "parents": [],
              "selfClosing": false,
              "type": "paragraph",
            },
          ],
          "marks": [],
          "text": "￼Horizontal￼￼rules!",
        }
      `);
    });

    test("img", () => {
      let doc = HTMLSource.fromRaw(
        '<img src="https://pbs.twimg.com/media/DXiMcM9X4AEhR3u.jpg" alt="Miles Davis came out, blond, in gold lamé, and he plays really terrific music. High heels. 4/6/86" title="Miles Davis & Andy Warhol">',
      ).convertTo(OffsetSource);
      expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
        {
          "blocks": [
            {
              "attributes": {
                "description": "Miles Davis came out, blond, in gold lamé, and he plays really terrific music. High heels. 4/6/86",
                "title": "Miles Davis & Andy Warhol",
                "url": "https://pbs.twimg.com/media/DXiMcM9X4AEhR3u.jpg",
              },
              "id": "B00000000",
              "parents": [],
              "selfClosing": true,
              "type": "image",
            },
          ],
          "marks": [],
          "text": "￼",
        }
      `);
    });

    test("code", () => {
      let doc = HTMLSource.fromRaw(
        `<code>console.log('wowowowow');</code>`,
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
          ],
          "marks": [
            {
              "attributes": {},
              "id": "M00000000",
              "range": "(1..26]",
              "type": "code",
            },
          ],
          "text": "￼console.log('wowowowow');",
        }
      `);
    });

    describe("code blocks", () => {
      test("pre code", () => {
        let doc = HTMLSource.fromRaw(
          `<pre> <code>console.log('wowowowow');</code>\n</pre>`,
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
                "attributes": {},
                "id": "B00000001",
                "parents": [],
                "selfClosing": false,
                "type": "code-block",
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
            "text": "￼ ￼console.log('wowowowow');￼
          ",
          }
        `);
      });

      test("multiple code blocks inside of pre", () => {
        let doc = HTMLSource.fromRaw(
          `<pre><code>console.log('wow');</code><code>console.log('wowowow');</code></pre>`,
        ).convertTo(OffsetSource);
        doc.where((a) => a.type === "unknown").remove();

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
            ],
            "marks": [
              {
                "attributes": {},
                "id": "M00000000",
                "range": "(1..20]",
                "type": "code",
              },
              {
                "attributes": {},
                "id": "M00000001",
                "range": "(20..43]",
                "type": "code",
              },
            ],
            "text": "￼console.log('wow');console.log('wowowow');",
          }
        `);
      });

      test("text inside of pre, but not code", () => {
        let doc = HTMLSource.fromRaw(
          `<pre>hi<code>console.log('wowowow');</code></pre>`,
        ).convertTo(OffsetSource);
        doc.where((a) => a.type === "unknown").remove();

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
            ],
            "marks": [
              {
                "attributes": {},
                "id": "M00000000",
                "range": "(3..26]",
                "type": "code",
              },
            ],
            "text": "￼hiconsole.log('wowowow');",
          }
        `);
      });
    });

    test("ul, ol, li", () => {
      let doc = HTMLSource.fromRaw(
        '<ol start="2"><li>Second</li><li>Third</li></ol><ul><li>First</li><li>Second</li></ul>',
      ).convertTo(OffsetSource);
      expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
        {
          "blocks": [
            {
              "attributes": {
                "startsAt": 2,
                "type": "numbered",
              },
              "id": "B00000000",
              "parents": [],
              "selfClosing": false,
              "type": "list",
            },
            {
              "attributes": {},
              "id": "B00000001",
              "parents": [
                "list",
              ],
              "selfClosing": false,
              "type": "list-item",
            },
            {
              "attributes": {},
              "id": "B00000002",
              "parents": [
                "list",
              ],
              "selfClosing": false,
              "type": "list-item",
            },
            {
              "attributes": {
                "type": "bulleted",
              },
              "id": "B00000003",
              "parents": [],
              "selfClosing": false,
              "type": "list",
            },
            {
              "attributes": {},
              "id": "B00000004",
              "parents": [
                "list",
              ],
              "selfClosing": false,
              "type": "list-item",
            },
            {
              "attributes": {},
              "id": "B00000005",
              "parents": [
                "list",
              ],
              "selfClosing": false,
              "type": "list-item",
            },
          ],
          "marks": [],
          "text": "￼￼Second￼Third￼￼First￼Second",
        }
      `);
    });

    test("section", () => {
      let doc = HTMLSource.fromRaw(
        `<section><p>Paragraph in a section.</p></section>`,
      ).convertTo(OffsetSource);

      expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
        {
          "blocks": [
            {
              "attributes": {},
              "id": "B00000000",
              "parents": [],
              "selfClosing": false,
              "type": "section",
            },
            {
              "attributes": {},
              "id": "B00000001",
              "parents": [
                "section",
              ],
              "selfClosing": false,
              "type": "paragraph",
            },
          ],
          "marks": [],
          "text": "￼￼Paragraph in a section.",
        }
      `);
    });

    test("smallcaps", () => {
      let doc = HTMLSource.fromRaw(
        `<p><span class="smallcaps">SmallCaps</span> in a paragraph.</p>`,
      ).convertTo(OffsetSource);

      expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
        {
          "blocks": [
            {
              "attributes": {},
              "id": "B00000000",
              "parents": [],
              "selfClosing": false,
              "type": "paragraph",
            },
          ],
          "marks": [
            {
              "attributes": {
                "-html-class": "smallcaps",
              },
              "id": "M00000000",
              "range": "(1..10]",
              "type": "small-caps",
            },
          ],
          "text": "￼SmallCaps in a paragraph.",
        }
      `);
    });
  });
});
