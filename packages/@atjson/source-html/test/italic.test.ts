import { serialize } from "@atjson/document";
import OffsetSource from "@atjson/offset-annotations";
import HTMLSource from "../src";

describe("Italic", () => {
  test.each(["i", "em"])("%s", (tagName) => {
    let doc = HTMLSource.fromRaw(
      `This <${tagName}>text</${tagName}> is <${tagName}>italic</${tagName}>`,
    ).convertTo(OffsetSource);
    expect(serialize(doc)).toMatchObject({
      text: "\uFFFCThis text is italic",
      blocks: [{ type: "text" }],
      marks: [
        {
          type: "italic",
          range: "(6..10]",
        },
        {
          type: "italic",
          range: "(14..20]",
        },
      ],
    });
  });
});
