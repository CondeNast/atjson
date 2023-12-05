import { serialize } from "@atjson/document";
import OffsetSource from "@atjson/offset-annotations";
import HTMLSource from "../src";

describe("Cne Ticketing Widget embeds", () => {
  test("only baseurl", () => {
    let doc = HTMLSource.fromRaw(
      `<cne-ticketing-widget url="https://baseurl"></cne-ticketing-widget>`
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {
              "url": "https://baseurl",
            },
            "id": "B00000000",
            "parents": [],
            "selfClosing": false,
            "type": "cne-ticketing-widget-embed",
          },
        ],
        "marks": [],
        "text": "￼",
      }
    `);
  });

  test("full param", () => {
    let doc = HTMLSource.fromRaw(
      `<cne-ticketing-widget url="https://baseurl?loggedout=loggedouturlslug&loggedin=loggedinslug&privacy=true"></cne-ticketing-widget>`
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {
              "url": "https://baseurl?loggedout=loggedouturlslug&loggedin=loggedinslug&privacy=true",
            },
            "id": "B00000000",
            "parents": [],
            "selfClosing": false,
            "type": "cne-ticketing-widget-embed",
          },
        ],
        "marks": [],
        "text": "￼",
      }
    `);
  });
});
