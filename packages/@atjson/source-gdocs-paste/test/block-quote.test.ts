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
    expect(serialize(doc)).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "attributes": {},
            "id": "f7cd3075-8e6c-4eeb-919f-7c03467c84bb",
            "parents": [],
            "selfClosing": false,
            "type": "paragraph",
          },
          {
            "attributes": {},
            "id": "f41117e5-7fa4-43f2-bff1-163347873ef9",
            "parents": [],
            "selfClosing": false,
            "type": "blockquote",
          },
          {
            "attributes": {},
            "id": "20c97926-897b-47f2-a6cd-ce94a57e280e",
            "parents": [],
            "selfClosing": false,
            "type": "text",
          },
          {
            "attributes": {},
            "id": "16a33c18-c408-4bfc-b129-c8e6e40bd083",
            "parents": [],
            "selfClosing": false,
            "type": "blockquote",
          },
          {
            "attributes": {},
            "id": "5bbdfba0-02a4-413f-88d8-66ec4242d4c8",
            "parents": [],
            "selfClosing": false,
            "type": "text",
          },
          {
            "attributes": {},
            "id": "9521c971-2718-4e98-9738-21c779e01ae6",
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
