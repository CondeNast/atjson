import { deserialize } from "@atjson/document";
import OffsetSource, { Paragraph } from "@atjson/offset-annotations";
import CommonmarkSource from "@atjson/source-commonmark";
import CommonmarkRenderer from "../src";

describe("commonmark", () => {
  test.each([">>", "#Chromatica", "- list item"])("escaping %s", (content) => {
    let document = new OffsetSource({
      content,
      annotations: [],
    });

    expect(CommonmarkRenderer.render(document)).toBe(`\\${content}`);
  });

  test.each([">>", "#Chromatica", "- list item"])(
    "escaping round trip %s",
    (content) => {
      let document = new OffsetSource({
        content,
        annotations: [new Paragraph({ start: 0, end: content.length })],
      });
      let roundTrip = CommonmarkSource.fromRaw(
        CommonmarkRenderer.render(document)
      ).convertTo(OffsetSource);

      expect(document.equals(roundTrip)).toBe(true);
    }
  );

  test.each([
    ["following text", "1. Something", "1\\. Something"],
    ["end of line", "1.", "1\\."],
  ])("text that looks like list item with %s", (_, text, md) => {
    const document = deserialize(
      {
        text: `\uFFFC${text}`,
        blocks: [
          {
            id: "B00000000",
            type: "text",
            parents: [],
            selfClosing: false,
            attributes: {},
          },
        ],
        marks: [],
      },
      OffsetSource
    );
    expect(CommonmarkRenderer.render(document)).toBe(md);
  });
});
