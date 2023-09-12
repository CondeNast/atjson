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
});
