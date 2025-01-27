import path from "path";
import fs from "fs";
import GDocsSource from "../src";
import OffsetSource, { Blockquote } from "@atjson/offset-annotations";
import { is } from "@atjson/document";

describe("@atjson/source-gdocs-paste blockquotes", () => {
  let doc: OffsetSource;
  beforeAll(() => {
    let fixturePath = path.join(__dirname, "fixtures", "block-quote.json");
    let rawJSON = JSON.parse(fs.readFileSync(fixturePath).toString());
    let gdocs = GDocsSource.fromRaw(rawJSON);
    doc = gdocs.convertTo(OffsetSource);
  });

  test("Indenting a paragraph makes a block quote", () => {
    let blockquotes = doc.annotations.filter((a) => is(a, Blockquote));
    expect(blockquotes.length).toBe(1);

    let [bq] = blockquotes;
    expect(doc.content.slice(bq.start, bq.end)).toBe(
      "This paragraph is indented, indicating a block quote"
    );
  });
});
