jest.unmock("uuid-random");

import OffsetSource, {
  IframeEmbed,
  Italic,
  Link,
  Paragraph,
} from "@atjson/offset-annotations";
import { ParseAnnotation, SliceAnnotation } from "@atjson/document";
import CommonmarkRenderer from "../src";
import uuid from "uuid-random";

describe("commonmark", () => {
  test("correct handling of slices and delimiter runs", () => {
    let captionId = uuid();
    let doc = new OffsetSource({
      content: "\uFFFC\nPop tarts\nAnd an emphasized link",
      annotations: [
        new IframeEmbed({
          start: 0,
          end: 1,
          attributes: {
            url: "https://www.youtube.com/embed/jYqRiKu7gY0",
            caption: captionId,
          },
        }),
        new ParseAnnotation({
          start: 0,
          end: 1,
        }),
        new ParseAnnotation({
          start: 1,
          end: 2,
        }),
        new SliceAnnotation({
          id: captionId,
          start: 2,
          end: 11,
        }),
        new ParseAnnotation({
          start: 11,
          end: 12,
        }),
        new Paragraph({
          start: 12,
          end: 34,
        }),
        new Italic({
          start: 19,
          end: 34,
        }),
        new Link({
          start: 19,
          end: 34,
          attributes: {
            url: "https://www.bonappetit.com",
          },
        }),
      ],
    });

    expect(CommonmarkRenderer.render(doc)).toBe(
      "And an *[emphasized link](https://www.bonappetit.com)*\n\n"
    );
  });
});
