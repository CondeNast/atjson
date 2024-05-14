import OffsetSource, { TextAlignment } from "@atjson/offset-annotations";
import HTMLSource from "../src";

describe("Paragraph", () => {
  describe("textAlignment", () => {
    describe("left to right", () => {
      describe.each([
        ["with direction attribute", `dir="ltr"`],
        ["without direction attribute", ""],
      ])("%s", (dir) => {
        test.each([
          ["left", TextAlignment.Start],
          ["right", TextAlignment.End],
          ["center", TextAlignment.Center],
          ["justify", TextAlignment.Justify],
        ] as const)("%s attribute is converted", (textAlign, textAlignment) => {
          let doc = HTMLSource.fromRaw(
            `<p style="text-align:${textAlign};" ${dir}>Here is some text</p>`
          ).convertTo(OffsetSource);

          expect(
            doc.where({ type: `-offset-paragraph` }).annotations
          ).toMatchObject([
            {
              attributes: {
                textAlignment,
              },
            },
          ]);
        });
      });
    });

    describe("right to left", () => {
      test.each([
        ["left", TextAlignment.End],
        ["right", TextAlignment.Start],
        ["center", TextAlignment.Center],
        ["justify", TextAlignment.Justify],
      ] as const)("%s attribute is converted", (textAlign) => {
        expect(() => {
          HTMLSource.fromRaw(
            `<p style="text-align:${textAlign};" dir="rtl">Here is some text</p>`
          ).convertTo(OffsetSource);
        }).toThrow();
      });
    });
  });

  test("fragment ids", () => {
    let doc = HTMLSource.fromRaw(
      `<p id="test">Here is some text</p>`
    ).convertTo(OffsetSource);

    expect(doc.where({ type: `-offset-paragraph` }).annotations).toMatchObject([
      {
        attributes: {
          anchorName: "test",
        },
      },
    ]);
  });
});
