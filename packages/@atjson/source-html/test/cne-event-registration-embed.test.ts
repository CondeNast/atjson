import { serialize } from "@atjson/document";
import OffsetSource from "@atjson/offset-annotations";
import HTMLSource from "../src";

describe("CNE Event Registration embed", () => {
  test("only baseurl", () => {
    let doc = HTMLSource.fromRaw(
      `<cne-event-registration url="https://baseurl"></cne-event-registration>`
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
            "type": "cne-event-registration-embed",
          },
        ],
        "marks": [],
        "text": "￼",
      }
    `);
  });

  test("full param", () => {
    let doc = HTMLSource.fromRaw(
      `<cne-event-registration url="https://baseurl?loggedout=loggedoutslug&loggedin=loggedinslug&privacy=true"></cne-event-registration>`
    ).convertTo(OffsetSource);

    expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {
              "url": "https://baseurl?loggedout=loggedoutslug&loggedin=loggedinslug&privacy=true",
            },
            "id": "B00000000",
            "parents": [],
            "selfClosing": false,
            "type": "cne-event-registration-embed",
          },
        ],
        "marks": [],
        "text": "￼",
      }
    `);
  });
});
