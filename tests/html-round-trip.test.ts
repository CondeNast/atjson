import HTMLRenderer from "@atjson/renderer-html";
import HTMLSource from "@atjson/source-html";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import OffsetSource from "@atjson/offset-annotations";

const FIXTURES = readdirSync(join(__dirname, "fixtures", "html")).map(
  (filename) => {
    return {
      filename,
      contents: readFileSync(
        join(__dirname, "fixtures", "html", filename)
      ).toString(),
    };
  }
);

describe("HTML round trip", () => {
  test.each(FIXTURES)("$1", ({ contents }) => {
    let originalDoc = HTMLSource.fromRaw(contents);
    let offsetDoc = originalDoc.convertTo(OffsetSource);
    let generatedHTML = HTMLRenderer.render(offsetDoc);

    expect(originalDoc.equals(HTMLSource.fromRaw(generatedHTML)));
  });
});
