import OffsetSource from "@atjson/offset-annotations";
import HTMLSource from "../src";

describe("headings", () => {
  test.each([
    ["h1", 1],
    ["h2", 2],
    ["h3", 3],
    ["h4", 4],
    ["h5", 5],
    ["h6", 6],
  ])("%s", (tagname, level) => {
    let doc = HTMLSource.fromRaw(
      `<${tagname}>Heading from ${tagname}</${tagname}>`
    ).convertTo(OffsetSource);
    expect(doc.where({ type: `-offset-heading` }).annotations).toMatchObject([
      { attributes: { level } },
    ]);
  });

  describe("alignment", () => {
    describe("left to right", () => {
      describe.each([
        ["with direction attribute", `dir="ltr"`],
        ["without direction attribute", ""],
      ])("%s", (dir) => {
        describe.each([
          ["left", "start"],
          ["center", "center"],
          ["right", "end"],
          ["justify", "justify"],
        ] as const)("%s", (textAlign, alignment) => {
          test.each([["h1"], ["h2"], ["h3"], ["h4"], ["h5"], ["h6"]])(
            "%s",
            (tagname) => {
              let doc = HTMLSource.fromRaw(
                `<${tagname} style="text-align:${textAlign};" ${dir}>Heading from ${tagname}</${tagname}>`
              ).convertTo(OffsetSource);
              expect(
                doc.where({ type: `-offset-heading` }).annotations
              ).toMatchObject([{ attributes: { alignment } }]);
            }
          );
        });
      });
    });

    describe("right to left", () => {
      describe.each([
        ["left", "end"],
        ["center", "center"],
        ["right", "start"],
        ["justify", "justify"],
      ] as const)("%s", (textAlign) => {
        test.each([["h1"], ["h2"], ["h3"], ["h4"], ["h5"], ["h6"]])(
          "%s",
          (tagname) => {
            expect(() => {
              HTMLSource.fromRaw(
                `<${tagname} style="text-align:${textAlign};" dir="rtl">Heading from ${tagname}</${tagname}>`
              ).convertTo(OffsetSource);
            }).toThrow();
          }
        );
      });
    });
  });

  describe("anchorName", () => {
    test.each([["h1"], ["h2"], ["h3"], ["h4"], ["h5"], ["h6"]])(
      "%s",
      (tagname) => {
        let doc = HTMLSource.fromRaw(
          `<${tagname} id="test">Heading from ${tagname}</${tagname}>`
        ).convertTo(OffsetSource);
        expect(
          doc.where({ type: `-offset-heading` }).annotations
        ).toMatchObject([{ attributes: { anchorName: "test" } }]);
      }
    );
  });
});
