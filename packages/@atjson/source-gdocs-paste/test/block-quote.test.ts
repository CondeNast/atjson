import path from "path";
import fs from "fs";
import GDocsSource from "../src";
import OffsetSource from "@atjson/offset-annotations";
import { serialize } from "@atjson/document";

describe("@atjson/source-gdocs-paste blockquotes", () => {
  let doc: OffsetSource;
  beforeAll(() => {
    let fixturePath = path.join(__dirname, "fixtures", "block-quote.json");
    let rawJSON = JSON.parse(fs.readFileSync(fixturePath).toString());
    let gdocs = GDocsSource.fromRaw(rawJSON);
    doc = gdocs.convertTo(OffsetSource);
  });

  test("Indenting a paragraph makes a block quote", () => {
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
            "type": "blockquote",
          },
          {
            "attributes": {},
            "id": "B00000002",
            "parents": [],
            "selfClosing": false,
            "type": "text",
          },
          {
            "attributes": {},
            "id": "B00000003",
            "parents": [],
            "selfClosing": false,
            "type": "blockquote",
          },
          {
            "attributes": {},
            "id": "B00000004",
            "parents": [],
            "selfClosing": false,
            "type": "text",
          },
          {
            "attributes": {},
            "id": "B00000005",
            "parents": [],
            "selfClosing": false,
            "type": "paragraph",
          },
        ],
        "marks": [],
        "text": "￼Example￼Nested￼

      ￼Double nested￼

      ￼Normal",
      }
    `);
  });
});
