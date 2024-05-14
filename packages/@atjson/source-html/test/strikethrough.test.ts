import { serialize } from "@atjson/document";
import OffsetSource from "@atjson/offset-annotations";
import HTMLSource from "../src";

describe("Strikethrough", () => {
  test.each(["s", "del"])("%s", (tagName) => {
    let doc = HTMLSource.fromRaw(
      `This <${tagName}>text</${tagName}> is <${tagName}>struck</${tagName}>`
    ).convertTo(OffsetSource);
    expect(serialize(doc)).toMatchObject({
      text: "\uFFFCThis text is struck",
      blocks: [{ type: "text" }],
      marks: [
        {
          type: "strikethrough",
          range: "(6..10]",
        },
        {
          type: "strikethrough",
          range: "(14..20]",
        },
      ],
    });
  });
});
