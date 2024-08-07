import { deserialize } from "@atjson/document";
import OffsetSource from "@atjson/offset-annotations";
import CommonmarkSource from "@atjson/source-commonmark";
import CommonmarkRenderer from "../src";

describe("commonmark", () => {
  test("raw atjson document", () => {
    let document = new OffsetSource({
      content: "Some text that is both bold and italic plus something after.",
      annotations: [
        { id: "1", type: "-offset-bold", start: 23, end: 31, attributes: {} },
        { id: "2", type: "-offset-italic", start: 28, end: 38, attributes: {} },
      ],
    });

    expect(CommonmarkRenderer.render(document)).toBe(
      "Some text that is both **bold *and*** *italic* plus something after."
    );
  });

  test("images", () => {
    let document = new OffsetSource({
      content: "\uFFFC",
      annotations: [
        {
          id: "1",
          type: "-offset-image",
          start: 0,
          end: 1,
          attributes: {
            "-offset-url": "http://commonmark.org/images/markdown-mark.png",
            "-offset-description":
              "Image descriptions ![are escaped](example.jpg)",
          },
        },
        {
          id: "1",
          type: "-atjson-parse-token",
          start: 0,
          end: 1,
          attributes: {},
        },
      ],
    });

    expect(CommonmarkRenderer.render(document)).toBe(
      "![Image descriptions \\\\![are escaped]\\\\(example.jpg)](http://commonmark.org/images/markdown-mark.png)"
    );
  });

  test("images with link", () => {
    expect(
      CommonmarkRenderer.render({
        text: "\uFFFC",
        blocks: [
          {
            id: "B01",
            type: "image",
            parents: [],
            attributes: {
              description: "December 11, 1995 P. 41",
              link: {
                url: "http://archives.newyorker.com/?i=1995-12-11#folio=040",
                title: "Image Title",
              },
              url: "https://static.cdn.realviewdigital.com/global/content/GetImage.aspx?pguid=FC9071DC-DD99-441F-A727-1B74670350BC&i=1995-12-11&folio=040",
            },
          },
        ],

        marks: [],
      })
    ).toBe(
      '[![December 11, 1995 P. 41](https://static.cdn.realviewdigital.com/global/content/GetImage.aspx?pguid=FC9071DC-DD99-441F-A727-1B74670350BC&i=1995-12-11&folio=040)](http://archives.newyorker.com/?i=1995-12-11#folio=040 "Image Title")'
    );
  });

  test("a plain text document with virtual paragraphs", () => {
    let document = new OffsetSource({
      content:
        "A paragraph with some bold\n\ntext that continues into the next.",
      annotations: [
        {
          id: "1",
          type: "-offset-paragraph",
          start: 0,
          end: 28,
          attributes: {},
        },
        {
          id: "2",
          type: "-atjson-parse-token",
          start: 26,
          end: 28,
          attributes: {},
        },
        {
          id: "3",
          type: "-offset-paragraph",
          start: 28,
          end: 62,
          attributes: {},
        },
        { id: "4", type: "-offset-bold", start: 22, end: 32, attributes: {} },
      ],
    });

    expect(CommonmarkRenderer.render(document)).toBe(
      "A paragraph with some **bold**\n\n**text** that continues into the next.\n\n"
    );
  });

  test("a naive list", () => {
    let document = new OffsetSource({
      content: "ABC",
      annotations: [
        {
          type: "-offset-list",
          start: 0,
          end: 3,
          attributes: { "-offset-type": "numbered" },
        },
        { type: "-offset-list-item", start: 0, end: 1, attributes: {} },
        { type: "-offset-list-item", start: 1, end: 2, attributes: {} },
        { type: "-offset-list-item", start: 2, end: 3, attributes: {} },
      ],
    });

    expect(CommonmarkRenderer.render(document)).toBe("1. A\n2. B\n3. C\n\n");
  });

  test("a naive list with new lines", () => {
    let document = new OffsetSource({
      content: "A\nBC",
      annotations: [
        {
          type: "-offset-list",
          start: 0,
          end: 4,
          attributes: { "-offset-type": "numbered" },
        },
        { type: "-offset-list-item", start: 0, end: 3, attributes: {} },
        { type: "-offset-list-item", start: 3, end: 4, attributes: {} },
      ],
    });

    expect(CommonmarkRenderer.render(document)).toBe("1. A\n   B\n2. C\n\n");
  });

  test("a list", () => {
    let document = new OffsetSource({
      content: [
        "I have a list:",
        "First item plus bold text",
        "Second item plus italic text",
        "Item 2a",
        "Item 2b",
        "After all the lists",
      ].join(""),
      annotations: [
        {
          id: "1",
          type: "-offset-paragraph",
          start: 0,
          end: 14,
          attributes: {},
        },
        { id: "2", type: "-offset-bold", start: 30, end: 34, attributes: {} },
        { id: "3", type: "-offset-italic", start: 56, end: 62, attributes: {} },
        {
          id: "4",
          type: "-offset-list",
          attributes: { "-offset-type": "numbered", "-offset-loose": false },
          start: 14,
          end: 81,
        },
        {
          id: "5",
          type: "-offset-list-item",
          start: 14,
          end: 39,
          attributes: {},
        },
        {
          id: "6",
          type: "-offset-paragraph",
          start: 14,
          end: 39,
          attributes: {},
        },
        {
          id: "7",
          type: "-offset-list-item",
          start: 39,
          end: 81,
          attributes: {},
        },
        {
          id: "8",
          type: "-offset-paragraph",
          start: 39,
          end: 67,
          attributes: {},
        },
        {
          id: "9",
          type: "-offset-list",
          attributes: { "-offset-type": "bulleted", "-offset-loose": false },
          start: 67,
          end: 81,
        },
        {
          id: "10",
          type: "-offset-list-item",
          start: 67,
          end: 74,
          attributes: {},
        },
        {
          id: "11",
          type: "-offset-paragraph",
          start: 67,
          end: 74,
          attributes: {},
        },
        {
          id: "12",
          type: "-offset-list-item",
          start: 74,
          end: 81,
          attributes: {},
        },
        {
          id: "13",
          type: "-offset-paragraph",
          start: 74,
          end: 81,
          attributes: {},
        },
        {
          id: "14",
          type: "-offset-paragraph",
          start: 81,
          end: 100,
          attributes: {},
        },
      ],
    });

    expect(CommonmarkRenderer.render(document)).toBe(
      `I have a list:

1. First item plus **bold** text
2. Second item plus *italic* text
   - Item 2a
   - Item 2b

After all the lists

`
    );
  });

  test("a list with internal linebreaks", () => {
    let document = new OffsetSource({
      content: "A\u000BB\nC",
      annotations: [
        {
          type: "-offset-list",
          start: 0,
          end: 5,
          attributes: { "-offset-type": "numbered" },
        },
        { type: "-offset-list-item", start: 0, end: 3, attributes: {} },
        { type: "-offset-line-break", start: 1, end: 2, attributes: {} },
        {
          type: "-atjson-parse-token",
          start: 1,
          end: 2,
          attributes: { "-atjson-reason": "vertical tab" },
        },
        {
          type: "-atjson-parse-token",
          start: 3,
          end: 4,
          attributes: { "-atjson-reason": "new line paragraph separator" },
        },
        { type: "-offset-list-item", start: 4, end: 5, attributes: {} },
      ],
    });

    expect(CommonmarkRenderer.render(document)).toBe("1. A  \n   B\n2. C\n\n");
  });

  test("preserve space between sentence-terminating italic + number.", () => {
    let document = new OffsetSource({
      content: "Sentence ending in *italic* 1. New sentence",
      annotations: [
        { type: "-offset-italic", start: 19, end: 27, attributes: {} },
        { type: "-atjson-parse-token", start: 19, end: 20, attributes: {} },
        { type: "-atjson-parse-token", start: 26, end: 27, attributes: {} },
      ],
    });

    expect(CommonmarkRenderer.render(document)).toBe(
      "Sentence ending in *italic* 1\\. New sentence"
    );
  });

  describe("links", () => {
    test("basic link", () => {
      let document = new OffsetSource({
        content: "I have a link",
        annotations: [
          {
            id: "1",
            type: "-offset-link",
            start: 9,
            end: 13,
            attributes: {
              "-offset-url": "https://example.com",
            },
          },
        ],
      });

      expect(CommonmarkRenderer.render(document)).toBe(
        "I have a [link](https://example.com)"
      );
    });

    test("with flanking whitespace", () => {
      let document = new OffsetSource({
        content: "I have a link with flanking whitespace",
        annotations: [
          {
            id: "1",
            type: "-offset-link",
            start: 8,
            end: 14,
            attributes: {
              "-offset-url": "https://example.com",
            },
          },
        ],
      });

      expect(CommonmarkRenderer.render(document)).toBe(
        "I have a [link](https://example.com) with flanking whitespace"
      );
    });
  });

  describe("blockquote", () => {
    test("single quote", () => {
      let document = new OffsetSource({
        content: "This is a quote\n\nThat has some\nlines in it.",
        annotations: [
          {
            id: "1",
            type: "-offset-blockquote",
            start: 0,
            end: 43,
            attributes: {},
          },
        ],
      });

      expect(CommonmarkRenderer.render(document)).toBe(
        "> This is a quote\n> \n> That has some\n> lines in it.\n\n"
      );
    });

    test("with a paragraph", () => {
      let document = new OffsetSource({
        content: "This is a quoteAnd this is not.",
        annotations: [
          {
            id: "1",
            type: "-offset-blockquote",
            start: 0,
            end: 15,
            attributes: {},
          },
          {
            id: "2",
            type: "-offset-paragraph",
            start: 0,
            end: 15,
            attributes: {},
          },
          {
            id: "3",
            type: "-offset-paragraph",
            start: 15,
            end: 31,
            attributes: {},
          },
        ],
      });

      expect(CommonmarkRenderer.render(document)).toBe(
        "> This is a quote\n\nAnd this is not.\n\n"
      );
    });

    test("with flanking whitespace", () => {
      let document = new OffsetSource({
        content: "\n\nThis is a quote\nAnd this is not.",
        annotations: [
          {
            id: "1",
            type: "-offset-blockquote",
            start: 0,
            end: 18,
            attributes: {},
          },
          {
            id: "2",
            type: "-offset-paragraph",
            start: 2,
            end: 18,
            attributes: {},
          },
          {
            id: "3",
            type: "-offset-paragraph",
            start: 18,
            end: 34,
            attributes: {},
          },
        ],
      });

      expect(CommonmarkRenderer.render(document)).toBe(
        "> This is a quote\n\nAnd this is not.\n\n"
      );
    });

    test("with surrounding paragraphs", () => {
      let document = new OffsetSource({
        content: "This is some text\n\nThis is a quote\n\nAnd this is not.",
        annotations: [
          {
            id: "1",
            type: "-offset-paragraph",
            start: 0,
            end: 19,
            attributes: {},
          },
          {
            id: "2",
            type: "-atjson-parse-token",
            start: 17,
            end: 19,
            attributes: {},
          },
          {
            id: "3",
            type: "-offset-blockquote",
            start: 19,
            end: 36,
            attributes: {},
          },
          {
            id: "4",
            type: "-offset-paragraph",
            start: 19,
            end: 36,
            attributes: {},
          },
          {
            id: "5",
            type: "-atjson-parse-token",
            start: 34,
            end: 36,
            attributes: {},
          },
          {
            id: "6",
            type: "-offset-paragraph",
            start: 36,
            end: 52,
            attributes: {},
          },
        ],
      });

      expect(CommonmarkRenderer.render(document)).toBe(
        "This is some text\n\n> This is a quote\n\nAnd this is not.\n\n"
      );
    });
  });

  test("handles horizontal-rules annotations", () => {
    let document = new OffsetSource({
      content: "x\uFFFCy",
      annotations: [
        {
          id: "1",
          type: "-offset-paragraph",
          start: 0,
          end: 1,
          attributes: {},
        },
        {
          id: "2",
          type: "-offset-horizontal-rule",
          start: 1,
          end: 2,
          attributes: {},
        },
        {
          id: "p1",
          type: "-atjson-parse-token",
          start: 1,
          end: 2,
          attributes: {},
        },
        {
          id: "3",
          type: "-offset-paragraph",
          start: 2,
          end: 3,
          attributes: {},
        },
      ],
    });

    expect(CommonmarkRenderer.render(document)).toBe("x\n\n***\ny\n\n");
  });

  test("headlines", () => {
    let document = new OffsetSource({
      content: "Banner\nHeadline\n",
      annotations: [
        {
          id: "1",
          type: "-offset-heading",
          start: 0,
          end: 7,
          attributes: { "-offset-level": 1 },
        },
        {
          id: "2",
          type: "-atjson-parse-token",
          start: 6,
          end: 7,
          attributes: { "-atjson-reason": "newline" },
        },
        {
          id: "3",
          type: "-offset-heading",
          start: 7,
          end: 16,
          attributes: { "-offset-level": 2 },
        },
        {
          id: "4",
          type: "-atjson-parse-token",
          start: 15,
          end: 16,
          attributes: { "-atjson-reason": "newline" },
        },
      ],
    });

    expect(CommonmarkRenderer.render(document)).toBe("# Banner\n## Headline\n");
  });

  test("moves spaces at annotation boundaries to the outside", () => {
    let document = new OffsetSource({
      content: "This is bold text and a link.",
      annotations: [
        {
          id: "1",
          type: "-offset-bold",
          start: 8,
          end: 13,
          attributes: {},
        },
        {
          id: "2",
          type: "-offset-link",
          start: 23,
          end: 28,
          attributes: { "-offset-url": "https://example.com" },
        },
      ],
    });

    expect(CommonmarkRenderer.render(document)).toBe(
      "This is **bold** text and a [link](https://example.com)."
    );
  });

  test("unambiguous nesting of bold and italic", () => {
    let document = new OffsetSource({
      content: "\uFFFCbold then italic\uFFFC \uFFFCitalic then bold\uFFFC",
      annotations: [
        {
          id: "1",
          type: "-atjson-parse-token",
          start: 0,
          end: 1,
          attributes: {},
        },
        {
          id: "2",
          type: "-offset-bold",
          start: 0,
          end: 18,
          attributes: {},
        },
        {
          id: "3",
          type: "-offset-italic",
          start: 1,
          end: 17,
          attributes: {},
        },
        {
          id: "4",
          type: "-atjson-parse-token",
          start: 17,
          end: 18,
          attributes: {},
        },
        {
          id: "5",
          type: "-atjson-parse-token",
          start: 19,
          end: 20,
          attributes: {},
        },
        {
          id: "6",
          type: "-offset-italic",
          start: 19,
          end: 37,
          attributes: {},
        },
        {
          id: "7",
          type: "-offset-bold",
          start: 20,
          end: 36,
          attributes: {},
        },
        {
          id: "8",
          type: "-atjson-parse-token",
          start: 36,
          end: 37,
          attributes: {},
        },
      ],
    });

    expect(CommonmarkRenderer.render(document)).toBe(
      "***bold then italic*** ***italic then bold***"
    );
  });

  test("adjacent bold and italic annotations are given unique markdown makers", () => {
    let document = new OffsetSource({
      content:
        "\uFFFCbold\uFFFC\uFFFCthen italic\uFFFC\n\uFFFCitalic\uFFFC\uFFFCthen bold\uFFFC\n",
      annotations: [
        {
          id: "1",
          type: "-offset-paragraph",
          start: 0,
          end: 20,
          attributes: {},
        },
        {
          id: "2",
          type: "-atjson-parse-token",
          start: 0,
          end: 1,
          attributes: {},
        },
        {
          id: "3",
          type: "-offset-bold",
          start: 0,
          end: 6,
          attributes: {},
        },
        {
          id: "4",
          type: "-atjson-parse-token",
          start: 5,
          end: 6,
          attributes: {},
        },
        {
          id: "5",
          type: "-atjson-parse-token",
          start: 6,
          end: 7,
          attributes: {},
        },
        {
          id: "6",
          type: "-offset-italic",
          start: 6,
          end: 20,
          attributes: {},
        },
        {
          id: "7",
          type: "-atjson-parse-token",
          start: 18,
          end: 19,
          attributes: {},
        },
        {
          id: "8",
          type: "-atjson-parse-token",
          start: 19,
          end: 20,
          attributes: {},
        },
        {
          id: "9",
          type: "-offset-paragraph",
          start: 20,
          end: 40,
          attributes: {},
        },
        {
          id: "10",
          type: "-atjson-parse-token",
          start: 20,
          end: 21,
          attributes: {},
        },
        {
          id: "11",
          type: "-offset-italic",
          start: 20,
          end: 28,
          attributes: {},
        },
        {
          id: "12",
          type: "-atjson-parse-token",
          start: 27,
          end: 28,
          attributes: {},
        },
        {
          id: "13",
          type: "-atjson-parse-token",
          start: 28,
          end: 29,
          attributes: {},
        },
        {
          id: "14",
          type: "-offset-bold",
          start: 28,
          end: 39,
          attributes: {},
        },
        {
          id: "15",
          type: "-atjson-parse-token",
          start: 38,
          end: 39,
          attributes: {},
        },
        {
          id: "16",
          type: "-atjson-parse-token",
          start: 39,
          end: 40,
          attributes: {},
        },
      ],
    });

    expect(CommonmarkRenderer.render(document)).toBe(
      "**bold**_then italic_\n\n_italic_**then bold**\n\n"
    );
  });

  test("five * are avoided", () => {
    let document = deserialize(
      {
        text: "\uFFFCSpace: the final frontier",
        blocks: [
          {
            id: "B00000000",
            type: "text",
            parents: [],
            selfClosing: false,
            attributes: {},
          },
        ],
        marks: [
          {
            id: "M00000000",
            type: "bold",
            range: "[1..6]",
            attributes: {},
          },
          {
            id: "M00000001",
            type: "italic",
            range: "[1..6]",
            attributes: {},
          },
          {
            id: "M00000002",
            type: "bold",
            range: "[6..26]",
            attributes: {},
          },
        ],
      },
      OffsetSource
    );

    expect(CommonmarkRenderer.render(document)).toBe(
      "***Space***__: the final frontier__"
    );
  });

  describe("html entities", () => {
    describe("escapeHtmlEntities", () => {
      test("&", () => {
        let doc = new OffsetSource({ content: "&", annotations: [] });
        expect(CommonmarkRenderer.render(doc)).toBe("&");
      });

      test("<", () => {
        let doc = new OffsetSource({ content: "<", annotations: [] });
        expect(CommonmarkRenderer.render(doc)).toBe("&lt;");
      });

      test.each(["&amp;", "&nbsp;", "&lt;"])("$1", (entity) => {
        let doc = new OffsetSource({ content: entity, annotations: [] });
        expect(CommonmarkRenderer.render(doc)).toBe("\\" + entity);
      });

      test.each([
        ["&emsp;", "\u2003"],
        ["&nbsp;", "\u00a0"],
      ])("%s", (entity, unicode) => {
        let doc = new OffsetSource({ content: unicode, annotations: [] });
        expect(CommonmarkRenderer.render(doc)).toBe(entity);
        expect(
          CommonmarkRenderer.render(doc, { escapeHtmlEntities: false })
        ).toBe(entity);
      });
    });

    describe(`don't escapeHtmlEntities`, () => {
      test("&", () => {
        let doc = new OffsetSource({ content: "&", annotations: [] });
        expect(CommonmarkRenderer.render(doc)).toBe("&");
      });

      test("<", () => {
        let doc = new OffsetSource({ content: "<", annotations: [] });
        expect(
          CommonmarkRenderer.render(doc, { escapeHtmlEntities: false })
        ).toBe("<");
      });

      test.each(["&amp;", "&nbsp;", "&lt;"])("$1", (entity) => {
        let doc = new OffsetSource({ content: entity, annotations: [] });
        expect(CommonmarkRenderer.render(doc)).toBe("\\&" + entity.slice(1));
      });
    });
  });

  describe("boundary punctuation", () => {
    describe("is adjacent to non-whitespace non-punctuation characters", () => {
      // a*—italic—*non-italic -> a—*italic*—non-italic
      test("boundary punctuation is pushed out of annotations", () => {
        let document = new OffsetSource({
          content: "a\u2014italic\u2014non-italic",
          annotations: [
            {
              id: "1",
              type: "-offset-italic",
              start: 1,
              end: 9,
              attributes: {},
            },
          ],
        });

        expect(CommonmarkRenderer.render(document)).toBe(
          "a—*italic*—non-italic"
        );
      });

      // [link.](https://some-url.com)a
      test("links retain boundary punctuation", () => {
        let document = new OffsetSource({
          content: "link.a",
          annotations: [
            {
              id: "1",
              type: "-offset-link",
              start: 0,
              end: 5,
              attributes: { url: "https://some-url.com" },
            },
          ],
        });

        expect(CommonmarkRenderer.render(document)).toBe(
          "[link.](https://some-url.com)a"
        );
      });

      test("delimiters with newline in the inner boundary", () => {
        let document = new OffsetSource({
          content: "bold\na",
          annotations: [
            {
              type: "-offset-bold",
              start: 0,
              end: 5,
              attributes: {},
            },
            {
              type: "-atjson-parse-token",
              start: 4,
              end: 5,
              attributes: {},
            },
            {
              type: "-offset-line-break",
              start: 4,
              end: 5,
              attributes: {},
            },
          ],
        });
        expect(CommonmarkRenderer.render(document)).toBe("**bold**  \na");
      });

      test("delimiters with backslash in the inner boundary", () => {
        let document = new OffsetSource({
          content: "bold\\\na",
          annotations: [
            {
              type: "-offset-bold",
              start: 0,
              end: 6,
              attributes: {},
            },
            {
              type: "-atjson-parse-token",
              start: 5,
              end: 6,
              attributes: {},
            },
            {
              type: "-offset-line-break",
              start: 5,
              end: 6,
              attributes: {},
            },
          ],
        });
        expect(CommonmarkRenderer.render(document)).toBe("**bold\\\\**  \na");
      });

      test("delimiters with multiple backslash and newline in the inner boundary", () => {
        let document = new OffsetSource({
          content: "bold\\\\\na",
          annotations: [
            {
              type: "-offset-bold",
              start: 0,
              end: 7,
              attributes: {},
            },
          ],
        });
        expect(CommonmarkRenderer.render(document)).toBe("**bold\\\\\\\\**\na");
      });

      // *[menu.as](https://menu.as/)*\n\n\n\n__Missoni Partners with Donghia__\n\n
      test("delimiters wrapping links are not parsed as punctuation at paragraph boundaries", () => {
        let md =
          "[*menu.as*](https://menu.as/)\n\n**Missoni Partners with Donghia**\n\n";
        let mdDoc = CommonmarkSource.fromRaw(md);
        let document = mdDoc.convertTo(OffsetSource);

        expect(CommonmarkRenderer.render(document)).toBe(md);
      });

      // **bold:**[link](http://url.com)
      test("wrapping adjacent characters in an annotation preserves boundary punctuation", () => {
        let md = "**bold:**[link](http://url.com)";
        let mdDoc = CommonmarkSource.fromRaw(md);
        let document = mdDoc.convertTo(OffsetSource);

        expect(CommonmarkRenderer.render(document).trim()).toBe(md);
      });

      // *a.*^b^ -> *a*.b if superscript annotations are unsupported
      test("wrapping adjacent characters in an unknown annotation does not preserve boundary punctuation", () => {
        let document = new OffsetSource({
          content: "*a.*^b^",
          annotations: [
            {
              id: "1",
              type: "-atjson-parse-token",
              start: 0,
              end: 1,
              attributes: {},
            },
            {
              id: "1",
              type: "-offset-italic",
              start: 0,
              end: 4,
              attributes: {},
            },
            {
              id: "1",
              type: "-atjson-parse-token",
              start: 3,
              end: 4,
              attributes: {},
            },
            {
              id: "1",
              type: "-atjson-parse-token",
              start: 4,
              end: 5,
              attributes: {},
            },
            {
              id: "1",
              type: "-atjson-unknown",
              start: 4,
              end: 7,
              attributes: {},
            },
            {
              id: "1",
              type: "-atjson-parse-token",
              start: 6,
              end: 7,
              attributes: {},
            },
          ],
        });

        // preserved here for correct behaviour in case we decide not to throw,
        // or to implement an `ignoreUnknown` flag or similar.
        // expect(CommonmarkRenderer.render(document)).toBe("*a*.b");
        expect(() => CommonmarkRenderer.render(document)).toThrow();
      });

      // This is a weird case in that it results in asymmetric parens, but is probably the
      // most correct thing to do
      // a—*(italic)*non-italic -> a—*(italic*)non-italic
      test("boundary paranthesis is pushed out of annotations", () => {
        let document = new OffsetSource({
          content: "a\u2014(italic)non-italic",
          annotations: [
            {
              id: "1",
              type: "-offset-italic",
              start: 1,
              end: 9,
              attributes: {},
            },
          ],
        });

        expect(CommonmarkRenderer.render(document)).toBe(
          "a—*(italic*)non-italic"
        );
      });

      // *italic]*non-italic -> *italic*\]non-italic
      test("backslash-escaped punctuation is fully pushed out of annotations", () => {
        let document = new OffsetSource({
          content: "italic]non-italic",
          annotations: [
            {
              id: "1",
              type: "-offset-italic",
              start: 0,
              end: 7,
              attributes: {},
            },
          ],
        });

        expect(CommonmarkRenderer.render(document)).toBe(
          "*italic*\\]non-italic"
        );
      });

      // *italic\]*non-italic -> *italic\\*\]non-italic
      test("multiple backslash escapes are correctly parsed", () => {
        let document = new OffsetSource({
          content: "italic\\]non-italic",
          annotations: [
            {
              id: "1",
              type: "-offset-italic",
              start: 0,
              end: 8,
              attributes: {},
            },
          ],
        });

        expect(CommonmarkRenderer.render(document)).toBe(
          "*italic\\\\*\\]non-italic"
        );
      });

      // *italic..*non-italic -> *italic.*.non-italic
      test("non-escape punctuation sequences only push out the boundary characters", () => {
        let document = new OffsetSource({
          content: "italic..non-italic",
          annotations: [
            {
              id: "1",
              type: "-offset-italic",
              start: 0,
              end: 8,
              attributes: {},
            },
          ],
        });

        expect(CommonmarkRenderer.render(document)).toBe(
          "*italic.*.non-italic"
        );
      });

      // *italic&*non-italic -> *italic*&non-italic
      test("entities are not split by pushing punctuation out of annotations", () => {
        let document = new OffsetSource({
          content: "italic&non-italic",
          annotations: [
            {
              id: "1",
              type: "-offset-italic",
              start: 0,
              end: 7,
              attributes: {},
            },
          ],
        });

        expect(CommonmarkRenderer.render(document)).toBe("*italic*&non-italic");
      });

      // a*&}italic&]*non-italic -> a&*\}italic&*\]non-italic
      test("entities and escaped punctuation work together", () => {
        let document = new OffsetSource({
          content: "a&}italic&]non-italic",
          annotations: [
            {
              id: "1",
              type: "-offset-italic",
              start: 1,
              end: 11,
              attributes: {},
            },
          ],
        });

        expect(CommonmarkRenderer.render(document)).toBe(
          "a&*\\}italic&*\\]non-italic"
        );
      });

      // **bold**_, then italic_ -> **bold**, *then italic*
      // _italic_**, then bold** -> _italic_, **then bold**
      test("adjacent bold and italic preserve boundary punctuation and are rendered correctly", () => {
        let document = new OffsetSource({
          content:
            "\uFFFCbold\uFFFC\uFFFC, then italic\uFFFC\n\uFFFCitalic\uFFFC\uFFFC, then bold\uFFFC\n",
          annotations: [
            {
              id: "1",
              type: "-offset-paragraph",
              start: 0,
              end: 21,
              attributes: {},
            },
            {
              id: "2",
              type: "-atjson-parse-token",
              start: 0,
              end: 1,
              attributes: {},
            },
            { id: "3", type: "-offset-bold", start: 0, end: 6, attributes: {} },
            {
              id: "4",
              type: "-atjson-parse-token",
              start: 5,
              end: 6,
              attributes: {},
            },
            {
              id: "5",
              type: "-atjson-parse-token",
              start: 6,
              end: 7,
              attributes: {},
            },
            {
              id: "6",
              type: "-offset-italic",
              start: 6,
              end: 21,
              attributes: {},
            },
            {
              id: "7",
              type: "-atjson-parse-token",
              start: 20,
              end: 21,
              attributes: {},
            },
            {
              id: "8",
              type: "-atjson-parse-token",
              start: 21,
              end: 22,
              attributes: {},
            },
            {
              id: "9",
              type: "-offset-paragraph",
              start: 22,
              end: 43,
              attributes: {},
            },
            {
              id: "10",
              type: "-atjson-parse-token",
              start: 22,
              end: 23,
              attributes: {},
            },
            {
              id: "11",
              type: "-offset-italic",
              start: 23,
              end: 30,
              attributes: {},
            },
            {
              id: "12",
              type: "-atjson-parse-token",
              start: 29,
              end: 30,
              attributes: {},
            },
            {
              id: "13",
              type: "-atjson-parse-token",
              start: 30,
              end: 31,
              attributes: {},
            },
            {
              id: "14",
              type: "-offset-bold",
              start: 30,
              end: 42,
              attributes: {},
            },
            {
              id: "15",
              type: "-atjson-parse-token",
              start: 42,
              end: 43,
              attributes: {},
            },
            {
              id: "16",
              type: "-atjson-parse-token",
              start: 43,
              end: 44,
              attributes: {},
            },
          ],
        });

        expect(CommonmarkRenderer.render(document)).toBe(
          "**bold**_, then italic_\n\n_italic_**, then bold**\n\n"
        );
      });
    });

    describe("is adjacent to whitespace", () => {
      test("boundary punctuation is retained in the annotation", () => {
        let document = new OffsetSource({
          content: " \u2014italic\u2014 non-italic",
          annotations: [
            {
              id: "1",
              type: "-offset-italic",
              start: 1,
              end: 9,
              attributes: {},
            },
          ],
        });

        expect(CommonmarkRenderer.render(document)).toBe(
          " *—italic—* non-italic"
        );
      });

      // `  *—italic— * non-italic` -> `  *-italic-*  non-italic`
      test("boundary whitespace is still moved out", () => {
        let document = new OffsetSource({
          content: "  \u2014italic\u2014  non-italic",
          annotations: [
            {
              id: "1",
              type: "-offset-italic",
              start: 2,
              end: 11,
              attributes: {},
            },
          ],
        });

        expect(CommonmarkRenderer.render(document)).toBe(
          "  *—italic—*  non-italic"
        );
      });
    });

    describe("is adjacent to document start or end", () => {
      test("boundary punctuation is retained in the annotation", () => {
        let document = new OffsetSource({
          content: "\u2014italic\u2014a\u2014bold\u2014",
          annotations: [
            {
              id: "1",
              type: "-offset-italic",
              start: 0,
              end: 8,
              attributes: {},
            },
            {
              id: "2",
              type: "-offset-bold",
              start: 9,
              end: 15,
              attributes: {},
            },
          ],
        });

        expect(CommonmarkRenderer.render(document)).toBe(
          "*—italic*—a—**bold—**"
        );
      });

      // `* —italic— *` -> ` *—italic—* `
      test("boundary whitespace is still moved out", () => {
        let document = new OffsetSource({
          content: " \u2014italic\u2014 ",
          annotations: [
            {
              id: "1",
              type: "-offset-italic",
              start: 0,
              end: 10,
              attributes: {},
            },
          ],
        });

        expect(CommonmarkRenderer.render(document)).toBe(" *—italic—* ");
      });
    });
  });

  test("empty format strings are removed", () => {
    let document = new OffsetSource({
      content: "Some formatting on empty spaces",
      annotations: [
        {
          id: "1",
          type: "-offset-bold",
          start: 1,
          end: 1,
          attributes: {},
        },
        {
          id: "2",
          type: "-offset-italic",
          start: 4,
          end: 5,
          attributes: {},
        },
      ],
    });

    expect(CommonmarkRenderer.render(document)).toBe(
      "Some formatting on empty spaces"
    );
  });

  test("non-breaking spaces don't receive formatting", () => {
    let document = new OffsetSource({
      content: "\u00A0\ntext\n\u202F",
      annotations: [
        {
          id: "1",
          type: "-offset-bold",
          start: 0,
          end: 7,
          attributes: {},
        },
        {
          id: "2",
          type: "-offset-paragraph",
          start: 0,
          end: 2,
          attributes: {},
        },
        {
          id: "3",
          type: "-atjson-parse-token",
          start: 1,
          end: 2,
          attributes: {},
        },
        {
          id: "4",
          type: "-offset-paragraph",
          start: 2,
          end: 7,
          attributes: {},
        },
        {
          id: "5",
          type: "-atjson-parse-token",
          start: 6,
          end: 7,
          attributes: {},
        },
      ],
    });

    expect(CommonmarkRenderer.render(document)).toBe(
      "&nbsp;\n\n**text**\n\n\u202F"
    );
  });

  test("line feed characters don't recieve formatting", () => {
    let document = new OffsetSource({
      content: "\u000b\ntext\n",
      annotations: [
        {
          id: "1",
          type: "-offset-bold",
          start: 0,
          end: 7,
          attributes: {},
        },
        {
          id: "2",
          type: "-offset-paragraph",
          start: 0,
          end: 2,
          attributes: {},
        },
        {
          id: "3",
          type: "-atjson-parse-token",
          start: 1,
          end: 2,
          attributes: {},
        },
        {
          id: "4",
          type: "-offset-paragraph",
          start: 2,
          end: 7,
          attributes: {},
        },
        {
          id: "5",
          type: "-atjson-parse-token",
          start: 6,
          end: 7,
          attributes: {},
        },
      ],
    });

    expect(CommonmarkRenderer.render(document)).toBe("\u000b\n\n**text**\n\n");
  });

  test("tabs and leading / trailing spaces are stripped from output", () => {
    let document = new OffsetSource({
      content: "\tHello \n    This is my text",
      annotations: [
        {
          id: "1",
          type: "-offset-paragraph",
          start: 0,
          end: 8,
          attributes: {},
        },
        {
          id: "2",
          type: "-offset-paragraph",
          start: 8,
          end: 27,
          attributes: {},
        },
      ],
    });

    let markdown = CommonmarkRenderer.render(document);

    expect(CommonmarkRenderer.render(document)).toBe(
      "Hello\n\nThis is my text\n\n"
    );
    // Make sure we're not generating code in the round-trip
    expect(markdown).toEqual(
      CommonmarkRenderer.render(
        CommonmarkSource.fromRaw(markdown).convertTo(OffsetSource)
      )
    );
  });

  test("emspaces are encoded", () => {
    let document = new OffsetSource({
      content: "\u2003\u2003\u2003\u2003Hello \n    This is my text",
      annotations: [
        {
          id: "1",
          type: "-offset-paragraph",
          start: 0,
          end: 11,
          attributes: {},
        },
        {
          id: "2",
          type: "-offset-paragraph",
          start: 11,
          end: 30,
          attributes: {},
        },
      ],
    });

    let markdown = CommonmarkRenderer.render(document);

    expect(markdown).toBe(
      "&emsp;&emsp;&emsp;&emsp;Hello\n\nThis is my text\n\n"
    );
    // Make sure we're not generating code in the round-trip
    expect(markdown).toEqual(
      CommonmarkRenderer.render(
        CommonmarkSource.fromRaw(markdown).convertTo(OffsetSource)
      )
    );
  });

  describe("escape sequences", () => {
    describe("numbers", () => {
      test.each(["5.8 million", "in 2016.", "2.0", "$280,000."])(
        "%s is not escaped",
        (text) => {
          let document = new OffsetSource({
            content: text,
            annotations: [],
          });

          expect(CommonmarkRenderer.render(document)).toBe(text);
        }
      );
    });

    describe("sic / citations", () => {
      test.each([
        "“[We] are",
        "“[Our algorithm] allows",
        "surpass [rival software] C",
        "for [my district] in 2016",
      ])("%s is not escaped", (text) => {
        let document = new OffsetSource({
          content: text,
          annotations: [],
        });

        expect(CommonmarkRenderer.render(document)).toBe(text);
      });
    });
  });

  describe("delimiter runs with Japanese", () => {
    test("full width stops with following sentence", () => {
      let document = deserialize(
        {
          text: "\uFFFCタイトルですにします太字。而",
          blocks: [
            {
              id: "B00000000",
              type: "paragraph",
              parents: [],
              selfClosing: false,
              attributes: {},
            },
          ],
          marks: [
            {
              id: "M00000000",
              type: "bold",
              range: "[1..13]",
              attributes: {},
            },
          ],
        },
        OffsetSource
      );

      expect(CommonmarkRenderer.render(document)).toBe(
        "**タイトルですにします太字**。而\n\n"
      );
    });

    test("aligned bold and italic, bold first", () => {
      let document = new OffsetSource({
        content: "タイトルですにします太字",
        annotations: [
          { id: "1", type: "-offset-bold", start: 6, end: 12, attributes: {} },
          {
            id: "2",
            type: "-offset-italic",
            start: 6,
            end: 12,
            attributes: {},
          },
        ],
      });

      expect(CommonmarkRenderer.render(document)).toBe(
        "タイトルです***にします太字***"
      );
    });

    test("aligned bold and italic, italic first", () => {
      let document = new OffsetSource({
        content: "タイトルですにします太字",
        annotations: [
          {
            id: "1",
            type: "-offset-italic",
            start: 6,
            end: 12,
            attributes: {},
          },
          { id: "2", type: "-offset-bold", start: 6, end: 12, attributes: {} },
        ],
      });

      expect(CommonmarkRenderer.render(document)).toBe(
        "タイトルです***にします太字***"
      );
    });

    test("adjacent bold and italic", () => {
      let document = new OffsetSource({
        content: "タイトルですにします太字",
        annotations: [
          { id: "1", type: "-offset-bold", start: 6, end: 8, attributes: {} },
          {
            id: "2",
            type: "-offset-italic",
            start: 8,
            end: 12,
            attributes: {},
          },
        ],
      });

      expect(CommonmarkRenderer.render(document)).toBe(
        "タイトルです**にし**_ます太字_"
      );
    });

    test("bold contained on left", () => {
      let document = new OffsetSource({
        content: "タイトルですにします太字",
        annotations: [
          { id: "1", type: "-offset-bold", start: 6, end: 8, attributes: {} },
          {
            id: "2",
            type: "-offset-italic",
            start: 6,
            end: 12,
            attributes: {},
          },
        ],
      });

      expect(CommonmarkRenderer.render(document)).toBe(
        "タイトルです***にし**ます太字*"
      );
    });

    test("bold contained on right", () => {
      let document = new OffsetSource({
        content: "タイトルですにします太字",
        annotations: [
          { id: "1", type: "-offset-bold", start: 8, end: 12, attributes: {} },
          {
            id: "2",
            type: "-offset-italic",
            start: 6,
            end: 12,
            attributes: {},
          },
        ],
      });

      expect(CommonmarkRenderer.render(document)).toBe(
        "タイトルです*にし**ます太字***"
      );
    });

    test("italic contained on left", () => {
      let document = new OffsetSource({
        content: "タイトルですにします太字",
        annotations: [
          { id: "1", type: "-offset-bold", start: 6, end: 12, attributes: {} },
          { id: "2", type: "-offset-italic", start: 6, end: 8, attributes: {} },
        ],
      });

      expect(CommonmarkRenderer.render(document)).toBe(
        "タイトルです***にし*ます太字**"
      );
    });

    test("italic contained on right", () => {
      let document = new OffsetSource({
        content: "タイトルですにします太字",
        annotations: [
          { id: "1", type: "-offset-bold", start: 6, end: 12, attributes: {} },
          {
            id: "2",
            type: "-offset-italic",
            start: 8,
            end: 12,
            attributes: {},
          },
        ],
      });

      expect(CommonmarkRenderer.render(document)).toBe(
        "タイトルです**にし*ます太字***"
      );
    });

    test("italic contained in bold", () => {
      let document = new OffsetSource({
        content: "タイトルですにします太字",
        annotations: [
          { id: "1", type: "-offset-bold", start: 6, end: 12, attributes: {} },
          {
            id: "2",
            type: "-offset-italic",
            start: 8,
            end: 10,
            attributes: {},
          },
        ],
      });

      expect(CommonmarkRenderer.render(document)).toBe(
        "タイトルです**にし*ます*太字**"
      );
    });

    test("bold contained in italic", () => {
      let document = new OffsetSource({
        content: "タイトルですにします太字",
        annotations: [
          { id: "1", type: "-offset-bold", start: 8, end: 10, attributes: {} },
          {
            id: "2",
            type: "-offset-italic",
            start: 6,
            end: 12,
            attributes: {},
          },
        ],
      });

      expect(CommonmarkRenderer.render(document)).toBe(
        "タイトルです*にし**ます**太字*"
      );
    });
  });

  describe("line breaks", () => {
    test("consecutive line breaks", () => {
      let document = new OffsetSource({
        content: "a\n\nb",
        annotations: [
          { type: "-offset-line-break", start: 1, end: 2, attributes: {} },
          { type: "-atjson-parse-token", start: 1, end: 2, attributes: {} },
          { type: "-offset-line-break", start: 2, end: 3, attributes: {} },
          { type: "-atjson-parse-token", start: 2, end: 3, attributes: {} },
        ],
      });

      expect(CommonmarkRenderer.render(document)).toEqual("a  \n  \nb");
    });

    test("Document with text and empty line break on next line.", () => {
      let document = new OffsetSource({
        content:
          "<$root>Testing<linebreak></linebreak><linebreak></linebreak>One Another<linebreak></linebreak></$root>",
        annotations: [
          {
            id: "82cc4694-3e0c-4ab6-8a7c-50670479a341",
            type: "-atjson-parse-token",
            start: 0,
            end: 7,
            attributes: {
              "-atjson-reason": "$root_open",
            },
          },
          {
            id: "9f5a3160-4ab2-4af8-a77d-f184801103e2",
            type: "-offset-line-break",
            start: 14,
            end: 37,
            attributes: {},
          },
          {
            id: "dab9716f-568a-41c8-9114-0eea9dddb283",
            type: "-atjson-parse-token",
            start: 14,
            end: 25,
            attributes: {
              "-atjson-reason": "linebreak_open",
            },
          },
          {
            id: "eedbf178-f53e-4e4a-9929-7a2c8684a8d7",
            type: "-atjson-parse-token",
            start: 25,
            end: 37,
            attributes: {
              "-atjson-reason": "linebreak_close",
            },
          },
          {
            id: "3d18057f-3289-4aa3-b001-04cf79110d99",
            type: "-offset-line-break",
            start: 37,
            end: 60,
            attributes: {},
          },
          {
            id: "658ccabb-46d0-492e-9552-7243b0cc4fc6",
            type: "-atjson-parse-token",
            start: 37,
            end: 48,
            attributes: {
              "-atjson-reason": "linebreak_open",
            },
          },
          {
            id: "9eec6d33-be6f-4d09-a777-488194df8950",
            type: "-atjson-parse-token",
            start: 48,
            end: 60,
            attributes: {
              "-atjson-reason": "linebreak_close",
            },
          },
          {
            id: "6f82c9a5-760f-41b9-956b-a269b769b399",
            type: "-offset-line-break",
            start: 71,
            end: 94,
            attributes: {},
          },
          {
            id: "4175f0ae-59b1-4706-b1b2-c86fe04733df",
            type: "-atjson-parse-token",
            start: 71,
            end: 82,
            attributes: {
              "-atjson-reason": "linebreak_open",
            },
          },
          {
            id: "7637a916-a923-4717-bb0d-639f93db70cd",
            type: "-atjson-parse-token",
            start: 82,
            end: 94,
            attributes: {
              "-atjson-reason": "linebreak_close",
            },
          },
          {
            id: "ba420b55-9fb3-4806-98b0-b2c578c54c76",
            type: "-atjson-parse-token",
            start: 94,
            end: 102,
            attributes: {
              "-atjson-reason": "$root_close",
            },
          },
        ],
      });

      expect(CommonmarkRenderer.render(document)).toBe(
        "Testing  \n  \nOne Another  \n"
      );
    });

    test("Document without any linebreak at end.", () => {
      let document = new OffsetSource({
        content:
          "<$root>Common<linebreak></linebreak><linebreak></linebreak>Mark</$root>",
        annotations: [
          {
            id: "79323f50-1c55-44d7-bdb6-6ca564f9dfe4",
            type: "-atjson-parse-token",
            start: 0,
            end: 7,
            attributes: {
              "-atjson-reason": "$root_open",
            },
          },
          {
            id: "dbe8cec9-314d-4c94-b740-bc8f702a50f6",
            type: "-offset-line-break",
            start: 13,
            end: 36,
            attributes: {},
          },
          {
            id: "ae7b7dde-16f5-4f81-b61f-810481c180d2",
            type: "-atjson-parse-token",
            start: 13,
            end: 24,
            attributes: {
              "-atjson-reason": "linebreak_open",
            },
          },
          {
            id: "5bb80af6-b265-4e70-8b0b-6d8076382cfc",
            type: "-atjson-parse-token",
            start: 24,
            end: 36,
            attributes: {
              "-atjson-reason": "linebreak_close",
            },
          },
          {
            id: "318764e6-d1e2-4e19-b7f8-879caa24f4ef",
            type: "-offset-line-break",
            start: 36,
            end: 59,
            attributes: {},
          },
          {
            id: "4d176464-f801-465d-97f6-9e1c8246b71d",
            type: "-atjson-parse-token",
            start: 36,
            end: 47,
            attributes: {
              "-atjson-reason": "linebreak_open",
            },
          },
          {
            id: "855b3060-6d16-489b-8704-346edbe8dd1a",
            type: "-atjson-parse-token",
            start: 47,
            end: 59,
            attributes: {
              "-atjson-reason": "linebreak_close",
            },
          },
          {
            id: "bf098c6b-bccf-4e1b-a4c2-8796a0703f38",
            type: "-atjson-parse-token",
            start: 63,
            end: 71,
            attributes: {
              "-atjson-reason": "$root_close",
            },
          },
        ],
      });

      expect(CommonmarkRenderer.render(document)).toBe("Common  \n  \nMark");
    });

    test("Document with all line breaks", () => {
      let document = new OffsetSource({
        content:
          "<$root><linebreak></linebreak><linebreak></linebreak><linebreak></linebreak></$root>",
        annotations: [
          {
            id: "ff84442c-9b87-4936-b7d1-0741ddf03685",
            type: "-atjson-parse-token",
            start: 0,
            end: 7,
            attributes: {
              "-atjson-reason": "$root_open",
            },
          },
          {
            id: "cc5afcc8-dddf-4dcd-aa6a-e1191465b198",
            type: "-offset-line-break",
            start: 7,
            end: 30,
            attributes: {},
          },
          {
            id: "992e0537-3eb5-4b74-92d6-c46c38440436",
            type: "-atjson-parse-token",
            start: 7,
            end: 18,
            attributes: {
              "-atjson-reason": "linebreak_open",
            },
          },
          {
            id: "c38a713f-e276-4d0f-a0e0-927e48af7fee",
            type: "-atjson-parse-token",
            start: 18,
            end: 30,
            attributes: {
              "-atjson-reason": "linebreak_close",
            },
          },
          {
            id: "29487bae-8b0b-4c70-89b6-e5ec62a9304c",
            type: "-offset-line-break",
            start: 30,
            end: 53,
            attributes: {},
          },
          {
            id: "0da8ef3b-4807-45d9-9629-1e0fd6c6d637",
            type: "-atjson-parse-token",
            start: 30,
            end: 41,
            attributes: {
              "-atjson-reason": "linebreak_open",
            },
          },
          {
            id: "76cdea7d-b223-4b43-8fe2-7f0967246a71",
            type: "-atjson-parse-token",
            start: 41,
            end: 53,
            attributes: {
              "-atjson-reason": "linebreak_close",
            },
          },
          {
            id: "468a3f4a-3f9b-4de1-bdef-e7ab802deb68",
            type: "-offset-line-break",
            start: 53,
            end: 76,
            attributes: {},
          },
          {
            id: "58b4d429-73bc-4968-9e96-df06fc505609",
            type: "-atjson-parse-token",
            start: 53,
            end: 64,
            attributes: {
              "-atjson-reason": "linebreak_open",
            },
          },
          {
            id: "412475eb-c68d-4aee-a6c6-c3676dbd0678",
            type: "-atjson-parse-token",
            start: 64,
            end: 76,
            attributes: {
              "-atjson-reason": "linebreak_close",
            },
          },
          {
            id: "08f6f3b1-aae1-4586-9fc8-a5a56a63287c",
            type: "-atjson-parse-token",
            start: 76,
            end: 84,
            attributes: {
              "-atjson-reason": "$root_close",
            },
          },
        ],
      });

      expect(CommonmarkRenderer.render(document)).toBe("  \n  \n  \n");
    });

    test.each([
      ["paragraph", "a\n\n"],
      ["blockquote", "> a\n\n"],
      ["heading", "## a\n"],
    ])("ending a %s are ignored", (name, output) => {
      let document = new OffsetSource({
        content: "a\n",
        annotations: [
          {
            type: `-offset-${name}`,
            start: 0,
            end: 2,
            attributes: { "-offset-level": 2 },
          },
          { type: "-offset-line-break", start: 1, end: 2, attributes: {} },
          { type: "-atjson-parse-token", start: 1, end: 2, attributes: {} },
        ],
      });

      expect(CommonmarkRenderer.render(document)).toEqual(output);
    });

    test("in a code block", () => {
      let document = new OffsetSource({
        content: "a\nb",
        annotations: [
          {
            type: "-offset-code",
            start: 0,
            end: 3,
            attributes: { "-offset-style": "inline" },
          },
          { type: "-offset-line-break", start: 1, end: 2, attributes: {} },
          { type: "-atjson-parse-token", start: 1, end: 2, attributes: {} },
        ],
      });

      expect(CommonmarkRenderer.render(document)).toEqual("`a\nb`");
    });
  });

  describe("fixed indent", () => {
    test("handles indent annotations of different sizes", () => {
      let document = new OffsetSource({
        content:
          "Normal text, \u2003Indented text\nMore text, \u2003\u2003\u2003Also indented",
        annotations: [
          {
            type: "-offset-fixed-indent",
            start: 13,
            end: 27,
            attributes: {},
          },
          {
            type: "-offset-fixed-indent",
            start: 39,
            end: 55,
            attributes: {},
          },
        ],
      });

      expect(CommonmarkRenderer.render(document)).toEqual(
        "Normal text, &emsp;Indented text\nMore text, &emsp;&emsp;&emsp;Also indented"
      );
    });
  });
});
