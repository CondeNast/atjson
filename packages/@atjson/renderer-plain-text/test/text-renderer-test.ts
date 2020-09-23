import Document, { ParseAnnotation } from "@atjson/document";
import HTMLSource from "@atjson/source-html";
import OffsetSource, {
  LineBreak,
  List,
  ListItem,
  Pullquote,
} from "@atjson/offset-annotations";

import PlainTextRenderer from "../src";

class PlainText extends Document {
  static contentType = "application/vnd.atjon+text";
  static schema = [];
}
describe("PlainTextRenderer", () => {
  it("returns the text from the atjson document", () => {
    let document = new PlainText({
      content: "☎️👨🏻⛵️🐳👌🏼",
      annotations: [
        {
          id: "1",
          type: "-emoji-translation",
          start: 0,
          end: 5,
          attributes: {
            lang: "en_us",
            translation: "Call me Ishmael",
          },
        },
      ],
    });
    let text = PlainTextRenderer.render(document);
    expect(text).toBe("☎️👨🏻⛵️🐳👌🏼");
  });

  it("strips virtual annotations", () => {
    let doc = HTMLSource.fromRaw(
      '<p>This is some <em>fancy</em> <span class="fancy">text</span>.'
    );

    let text = PlainTextRenderer.render(doc);
    expect(text).toBe("This is some fancy text.");
  });

  it("adds newlines between paragraphs", () => {
    let doc = HTMLSource.fromRaw("<p>One fish</p><p>Two fish</p>").convertTo(
      OffsetSource
    );

    let text = PlainTextRenderer.render(doc);
    expect(text).toBe("One fish\n\nTwo fish\n\n");
  });

  it("headings have newlines added around them", () => {
    let doc = HTMLSource.fromRaw("<h2>One fish</h2><p>Two fish</p>").convertTo(
      OffsetSource
    );

    let text = PlainTextRenderer.render(doc);
    expect(text).toBe("One fish\n\nTwo fish\n\n");
  });

  it("blockquotes have newlines added around them", () => {
    let doc = HTMLSource.fromRaw(
      "<blockquote>One fish</blockquote><p>Two fish</p>"
    ).convertTo(OffsetSource);

    let text = PlainTextRenderer.render(doc);
    expect(text).toBe("One fish\n\nTwo fish\n\n");
  });

  it("pullquotes have newlines added around them", () => {
    let doc = new OffsetSource({
      content: "One fish\uFFFCTwo fish",
      annotations: [
        new Pullquote({
          start: 8,
          end: 9,
        }),
      ],
    });

    let text = PlainTextRenderer.render(doc);
    expect(text).toBe("One fish\n\nTwo fish");
  });

  it("renders line breaks", () => {
    let document = new OffsetSource({
      content: "first line\uFFFCsecond line",
      annotations: [
        new LineBreak({
          start: 10,
          end: 11,
        }),
      ],
    });

    let text = PlainTextRenderer.render(document);
    expect(text).toBe("first line\nsecond line");
  });

  test.each([undefined, 2])(
    "numbered lists starting at %s are pretty printed",
    (startsAt) => {
      let document = new OffsetSource({
        content: "one fish\ntwo fish\nred fish\nblue fish",
        annotations: [
          new List({
            start: 0,
            end: 36,
            attributes: {
              type: "numbered",
              startsAt,
            },
          }),
          new ListItem({
            start: 0,
            end: 8,
          }),
          new ParseAnnotation({
            start: 8,
            end: 9,
            attributes: {
              reason: "list item",
            },
          }),
          new ListItem({
            start: 9,
            end: 17,
          }),
          new ParseAnnotation({
            start: 17,
            end: 18,
            attributes: {
              reason: "list item",
            },
          }),
          new ListItem({
            start: 18,
            end: 26,
          }),
          new ParseAnnotation({
            start: 26,
            end: 27,
            attributes: {
              reason: "list item",
            },
          }),
          new ListItem({
            start: 27,
            end: 36,
          }),
        ],
      });

      let index = startsAt ?? 1;
      let text = PlainTextRenderer.render(document);
      expect(text).toBe(
        `${index}. one fish\n${index + 1}. two fish\n${index + 2}. red fish\n${
          index + 3
        }. blue fish\n`
      );
    }
  );

  test("bulleted lists are pretty printed", () => {
    let document = new OffsetSource({
      content: "one fish\ntwo fish\nred fish\nblue fish",
      annotations: [
        new List({
          start: 0,
          end: 36,
          attributes: {
            type: "bulleted",
          },
        }),
        new ListItem({
          start: 0,
          end: 8,
        }),
        new ParseAnnotation({
          start: 8,
          end: 9,
          attributes: {
            reason: "list item",
          },
        }),
        new ListItem({
          start: 9,
          end: 17,
        }),
        new ParseAnnotation({
          start: 17,
          end: 18,
          attributes: {
            reason: "list item",
          },
        }),
        new ListItem({
          start: 18,
          end: 26,
        }),
        new ParseAnnotation({
          start: 26,
          end: 27,
          attributes: {
            reason: "list item",
          },
        }),
        new ListItem({
          start: 27,
          end: 36,
        }),
      ],
    });

    let text = PlainTextRenderer.render(document);
    expect(text).toBe("- one fish\n- two fish\n- red fish\n- blue fish\n");
  });
});
