import OffsetSource from "@atjson/offset-annotations";
import HTMLSource from "../src";

describe("blockquote", () => {
  test("without identifier", () => {
    let doc = HTMLSource.fromRaw(
      "<blockquote>This is a quote</blockquote>"
    ).convertTo(OffsetSource);
    expect(doc.where({ type: `-offset-blockquote` }).annotations).toMatchObject(
      [
        {
          start: 0,
          end: 40,
          attributes: {},
        },
      ]
    );
  });

  test("fragment ids", () => {
    let doc = HTMLSource.fromRaw(
      `<blockquote id="test">This is a quote</blockquote>`
    ).convertTo(OffsetSource);

    expect(doc.where({ type: `-offset-blockquote` }).annotations).toMatchObject(
      [
        {
          start: 0,
          end: 50,
          attributes: {
            anchorName: "test",
          },
        },
      ]
    );
  });
});
