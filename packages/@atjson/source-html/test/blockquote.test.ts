import { serialize } from "@atjson/document";
import OffsetSource from "@atjson/offset-annotations";
import HTMLSource from "../src";

describe("blockquote", () => {
  test("without identifier", () => {
    let doc = HTMLSource.fromRaw(
      "<blockquote>This is a quote</blockquote>"
    ).convertTo(OffsetSource);
    expect(serialize(doc)).toMatchObject({
      text: "\uFFFCThis is a quote",
      blocks: [
        {
          type: "blockquote",
          attributes: {},
        },
      ],
      marks: [],
    });
  });

  test("fragment ids", () => {
    let doc = HTMLSource.fromRaw(
      `<blockquote id="test">This is a quote</blockquote>`
    ).convertTo(OffsetSource);

    expect(serialize(doc)).toMatchObject({
      text: "\uFFFCThis is a quote",
      blocks: [
        {
          type: "blockquote",
          attributes: { anchorName: "test" },
        },
      ],
      marks: [],
    });
  });
});
