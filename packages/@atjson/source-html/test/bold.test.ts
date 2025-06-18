import { serialize } from "@atjson/document";
import OffsetSource from "@atjson/offset-annotations";
import HTMLSource from "../src";

describe("Bold", () => {
  test.each(["b", "strong"])("%s", (tagName) => {
    let doc = HTMLSource.fromRaw(
      `This <${tagName}>text</${tagName}> is <${tagName}>bold</${tagName}>`,
    ).convertTo(OffsetSource);
    expect(serialize(doc)).toMatchObject({
      text: "\uFFFCThis text is bold",
      blocks: [{ type: "text" }],
      marks: [
        {
          type: "bold",
          range: "(6..10]",
        },
        {
          type: "bold",
          range: "(14..18]",
        },
      ],
    });
  });
});
