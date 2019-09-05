import Document from "@atjson/document";
import HTMLSource from "@atjson/source-html";
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
            translation: "Call me Ishmael"
          }
        }
      ]
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
});
