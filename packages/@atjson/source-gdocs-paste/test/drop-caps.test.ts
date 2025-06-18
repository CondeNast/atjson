import path from "path";
import fs from "fs";
import GDocsSource from "../src";
import OffsetSource, { Paragraph } from "@atjson/offset-annotations";
import { is } from "@atjson/document";

describe("@atjson/source-gdocs-paste drop caps", () => {
  let doc: OffsetSource;
  beforeAll(() => {
    let fixturePath = path.join(
      __dirname,
      "fixtures",
      "drop-cap-shorthand.json",
    );
    let rawJSON = JSON.parse(fs.readFileSync(fixturePath).toString());
    let gdocs = GDocsSource.fromRaw(rawJSON);
    doc = gdocs.convertTo(OffsetSource);
  });

  test("Making the first letter of a paragraph a larger font creates a drop cap decoration", () => {
    let paragraphs = doc.annotations
      .filter((a) => is(a, Paragraph))
      .filter((p: Paragraph) => p.attributes.decorations?.includes("dropCap"));
    expect(paragraphs.length).toBe(2);
  });
});
