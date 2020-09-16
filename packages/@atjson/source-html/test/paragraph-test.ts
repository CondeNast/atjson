import OffsetSource from "@atjson/offset-annotations";
import HTMLSource from "../src";

describe("paragraphs", () => {
  describe("alignment", () => {
    describe("left to right", () => {
      test.each([
        ["left", "start"],
        ["right", "end"],
        ["center", "center"],
        ["justify", "justify"],
      ] as const)("%s attribute is converted", (textAlign, alignment) => {
        let doc = HTMLSource.fromRaw(
          `<p style="text-align:${textAlign};">Here is some text</p>`
        ).convertTo(OffsetSource);

        expect(
          doc.where({ type: `-offset-paragraph` }).annotations
        ).toMatchObject([
          {
            attributes: {
              alignment,
            },
          },
        ]);
      });
    });

    describe("right to left", () => {
      test.each([
        ["left", "end"],
        ["right", "start"],
        ["center", "center"],
        ["justify", "justify"],
      ] as const)("%s attribute is converted", (textAlign) => {
        expect(() => {
          HTMLSource.fromRaw(
            `<p style="text-align:${textAlign};" dir="rtl">Here is some text</p>`
          ).convertTo(OffsetSource);
        }).toThrow();
      });
    });
  });
});
