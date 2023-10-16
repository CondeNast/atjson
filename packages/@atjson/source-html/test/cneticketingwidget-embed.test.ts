import { serialize } from "@atjson/document";
import OffsetSource from "@atjson/offset-annotations";
import HTMLSource from "../src";

describe("Cne Ticketing Widget embeds", () => {
  test("only urlLoggedOut", () => {
    let doc = HTMLSource.fromRaw(
      `<cne-ticketing-widget urlloggedout="https://your/logged/out/url"></cne-ticketing-widget>`
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {
              "urlLoggedOut": "https://your/logged/out/url",
            },
            "id": "B00000000",
            "parents": [],
            "selfClosing": false,
            "type": "cneticketingwidget-embed",
          },
        ],
        "marks": [],
        "text": "￼",
      }
    `);
  });

  test("with urlLoggedOut urlLoggedIn", () => {
    let doc = HTMLSource.fromRaw(
      `<cne-ticketing-widget urlloggedout="https://your/logged/out/url" urlloggedin="https://your/logged/in/url"></cne-ticketing-widget>`
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {
              "urlLoggedIn": "https://your/logged/in/url",
              "urlLoggedOut": "https://your/logged/out/url",
            },
            "id": "B00000000",
            "parents": [],
            "selfClosing": false,
            "type": "cneticketingwidget-embed",
          },
        ],
        "marks": [],
        "text": "￼",
      }
    `);
  });

  test("with urlLoggedOut urlLoggedIn privacy", () => {
    let doc = HTMLSource.fromRaw(
      `<cne-ticketing-widget urlloggedout="https://your/logged/out/url" urlloggedin="https://your/logged/in/url" privacy="true"></cne-ticketing-widget>`
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {
              "privacy": "true",
              "urlLoggedIn": "https://your/logged/in/url",
              "urlLoggedOut": "https://your/logged/out/url",
            },
            "id": "B00000000",
            "parents": [],
            "selfClosing": false,
            "type": "cneticketingwidget-embed",
          },
        ],
        "marks": [],
        "text": "￼",
      }
    `);
  });

  test("with all param", () => {
    let doc = HTMLSource.fromRaw(
      `<cne-ticketing-widget urlloggedout="https://your/logged/out/url" urlloggedin="https://your/logged/in/url" privacy="true" width="600px" height="200px" caption="caption-test" sandbox="allow-scripts allow-same-origin allow-popups" anchorname="test"></cne-ticketing-widget>`
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {
              "anchorName": "test",
              "height": "200px",
              "privacy": "true",
              "sandbox": "allow-scripts allow-same-origin allow-popups",
              "urlLoggedIn": "https://your/logged/in/url",
              "urlLoggedOut": "https://your/logged/out/url",
              "width": "600px",
            },
            "id": "B00000000",
            "parents": [],
            "selfClosing": false,
            "type": "cneticketingwidget-embed",
          },
        ],
        "marks": [],
        "text": "￼",
      }
    `);
  });
});
