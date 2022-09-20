import { BlockAnnotation, InlineAnnotation, serialize } from "@atjson/document";
import MobiledocSource from "../src";
import { ListSection } from "../src/parser";

describe("@atjson/source-mobiledoc", () => {
  describe("sections", () => {
    describe.each([
      "p",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "pull-quote",
      "aside",
    ])("%s", (type) => {
      test("with text", () => {
        let doc = MobiledocSource.fromRaw({
          version: "0.3.1",
          atoms: [],
          cards: [],
          markups: [],
          sections: [[1, type.toUpperCase(), [[0, [], 0, "hello"]]]],
        });
        expect(serialize(doc)).toMatchObject({
          text: "\uFFFChello",
          blocks: [
            {
              type,
            },
          ],
        });
      });

      test("without text", () => {
        let doc = MobiledocSource.fromRaw({
          version: "0.3.1",
          atoms: [],
          cards: [],
          markups: [],
          sections: [[1, type.toUpperCase(), [[0, [], 0, ""]]]],
        });
        expect(serialize(doc)).toMatchObject({
          text: "\uFFFC",
          blocks: [
            {
              type,
            },
          ],
        });
      });
    });
  });

  describe("markup", () => {
    test.each(["b", "code", "em", "i", "s", "strong", "sub", "sup", "u"])(
      "%s",
      (type) => {
        let doc = MobiledocSource.fromRaw({
          version: "0.3.1",
          atoms: [],
          cards: [],
          markups: [[type.toUpperCase()]],
          sections: [[1, "P", [[0, [0], 1, "hello"]]]],
        });

        expect(serialize(doc)).toMatchObject({
          text: "\uFFFChello",
          blocks: [
            {
              type: "p",
            },
          ],
          marks: [
            {
              type,
              range: "(1..6]",
            },
          ],
        });
      }
    );

    test("simple markup", () => {
      let doc = MobiledocSource.fromRaw({
        version: "0.3.1",
        atoms: [],
        cards: [],
        markups: [["B"], ["A", ["href", "google.com"]]],
        sections: [
          [
            1,
            "P",
            [
              [0, [1], 0, "hello "], // a tag open
              [0, [0], 1, "brave new"], // b tag open/close
              [0, [], 1, " world"], // a tag close
            ],
          ],
        ],
      });

      expect(serialize(doc)).toMatchObject({
        text: "\uFFFChello brave new world",
        blocks: [
          {
            type: "p",
          },
        ],
        marks: [
          {
            type: "a",
            attributes: { href: "google.com" },
            range: "(1..22]",
          },
          {
            type: "b",
            range: "(7..16]",
          },
        ],
      });
    });

    test("multiple markups at a single position", () => {
      let doc = MobiledocSource.fromRaw({
        version: "0.3.1",
        atoms: [],
        cards: [],
        markups: [["STRONG"], ["SUB"]],
        sections: [[1, "P", [[0, [0, 1], 2, "test"]]]],
      });

      expect(serialize(doc)).toMatchObject({
        text: "\uFFFCtest",
        blocks: [
          {
            type: "p",
          },
        ],
        marks: [
          {
            type: "strong",
            range: "(1..5]",
          },
          {
            type: "sub",
            range: "(1..5]",
          },
        ],
      });
    });

    test("overlapping markup", () => {
      let doc = MobiledocSource.fromRaw({
        version: "0.3.1",
        atoms: [],
        cards: [],
        markups: [["EM"], ["STRONG"], ["U"]],
        sections: [
          [
            1,
            "P",
            [
              [0, [0], 0, "text that is "],
              [0, [1], 0, "bold, "],
              [0, [2], 2, "underlined"],
              [0, [], 1, ", and italicized"],
              [0, [], 0, " plus some text after"],
            ],
          ],
        ],
      });

      expect(serialize(doc)).toMatchObject({
        text: "\uFFFCtext that is bold, underlined, and italicized plus some text after",
        blocks: [
          {
            type: "p",
          },
        ],
        marks: [
          {
            type: "em",
            range: "(1..46]",
          },
          {
            type: "strong",
            range: "(14..30]",
          },
          {
            type: "u",
            range: "(20..30]",
          },
        ],
      });
    });
  });

  test("atom", () => {
    class Mention extends InlineAnnotation<{
      id: number;
    }> {
      static vendorPrefix = "mobiledoc";
      static type = "mention-atom";
    }

    class MentionSource extends MobiledocSource {
      static schema = [
        ...MobiledocSource.schema,
        Mention,
      ] as typeof MobiledocSource.schema;
    }

    let doc = MentionSource.fromRaw({
      version: "0.3.1",
      atoms: [["mention", "@bob", { id: 42 }]],
      cards: [],
      markups: [],
      sections: [[1, "P", [[1, [], 0, 0]]]],
    });

    expect(serialize(doc)).toMatchObject({
      text: "\uFFFC@bob",
      blocks: [
        {
          type: "p",
        },
      ],
      marks: [
        {
          type: "mention-atom",
          range: "(1..5]",
          attributes: { id: 42 },
        },
      ],
    });
  });

  test("card", () => {
    class Gallery extends BlockAnnotation<{
      style: "mosaic" | "slideshow" | "list";
      ids: number[];
    }> {
      static vendorPrefix = "mobiledoc";
      static type = "gallery-card";
    }

    class GallerySource extends MobiledocSource {
      static schema = [
        ...MobiledocSource.schema,
        Gallery,
      ] as typeof MobiledocSource.schema;
    }

    let doc = GallerySource.fromRaw({
      version: "0.3.1",
      atoms: [],
      cards: [
        [
          "gallery",
          {
            style: "mosaic",
            ids: [2, 4, 8, 14],
            size: null,
            dropped: undefined,
          },
        ],
      ],
      markups: [],
      sections: [[10, 0]],
    });

    expect(serialize(doc)).toMatchObject({
      text: "\uFFFC",
      blocks: [
        {
          type: "gallery-card",
          attributes: {
            style: "mosaic",
            ids: [2, 4, 8, 14],
            size: null,
          },
        },
      ],
    });
  });

  test("image", () => {
    let doc = MobiledocSource.fromRaw({
      version: "0.3.1",
      atoms: [],
      cards: [],
      markups: [],
      sections: [[2, "https://example.com/example.png"]],
    });

    expect(serialize(doc)).toMatchObject({
      text: "\uFFFC",
      blocks: [
        {
          type: "img",
          attributes: {
            src: "https://example.com/example.png",
          },
        },
      ],
    });
  });

  describe("list", () => {
    test.each(["ol", "ul"])("%s", (type) => {
      let doc = MobiledocSource.fromRaw({
        version: "0.3.1",
        atoms: [],
        cards: [],
        markups: [["EM"], ["S"]],
        sections: [
          [
            3,
            type,
            [
              [
                [0, [], 0, "first item "],
                [0, [0], 1, "with italic text"],
              ],
              [
                [0, [], 0, "second item "],
                [0, [1], 1, "with struck-through text"],
              ],
            ],
          ] as ListSection,
        ],
      });

      expect(serialize(doc)).toMatchObject({
        text: "\uFFFC\uFFFCfirst item with italic text\uFFFCsecond item with struck-through text",
        blocks: [
          { type },
          {
            type: "li",
            parents: [type],
          },
          {
            type: "li",
            parents: [type],
          },
        ],
        marks: [
          {
            type: "em",
            range: "(13..29]",
          },
          {
            type: "s",
            range: "(42..66]",
          },
        ],
      });
    });
  });
});
