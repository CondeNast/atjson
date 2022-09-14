import { ParseAnnotation, deserialize, serialize } from "@atjson/document";
import TestSource, {
  Anchor,
  Paragraph,
  Bold,
  Italic,
  List,
  ListItem,
  LineBreak,
  Quote,
} from "./test-source";

describe("serialize", () => {
  describe("blocks", () => {
    test("single block", () => {
      expect(
        serialize(
          new TestSource({
            content: "Hello, world",
            annotations: [
              new Paragraph({
                start: 0,
                end: 12,
              }),
            ],
          })
        )
      ).toMatchObject({
        text: "\uFFFCHello, world",
        blocks: [
          {
            type: "paragraph",
            attributes: {},
          },
        ],
        marks: [],
      });
    });

    test("objects", () => {
      expect(
        serialize(
          new TestSource({
            content: "Missy Elliott’s\uFFFC“Supa Dupa Fly”",
            annotations: [
              new LineBreak({
                start: 15,
                end: 16,
              }),
              new ParseAnnotation({
                start: 15,
                end: 16,
              }),
            ],
          })
        )
      ).toMatchObject({
        text: "\uFFFCMissy Elliott’s\uFFFC“Supa Dupa Fly”",
        blocks: [
          {
            type: "text",
            parents: [],
          },
          {
            type: "line-break",
            selfClosing: true,
            parents: ["text"],
            attributes: {},
          },
        ],
        marks: [],
      });
    });

    test("sparse blocks", () => {
      expect(
        serialize(
          new TestSource({
            content: "onetwothree",
            annotations: [
              new Paragraph({
                start: 3,
                end: 6,
              }),
            ],
          })
        )
      ).toMatchObject({
        text: "\uFFFCone\uFFFCtwo\uFFFCthree",
        blocks: [
          {
            type: "text",
            parents: [],
          },
          {
            type: "paragraph",
            parents: [],
          },
          {
            type: "text",
            parents: [],
          },
        ],
        marks: [],
      });
    });

    test("continuations in blocks", () => {
      expect(
        serialize(
          new TestSource({
            content: "onetwothreefour",
            annotations: [
              new Quote({
                start: 0,
                end: 11,
              }),
              new Paragraph({
                start: 3,
                end: 6,
              }),
            ],
          })
        )
      ).toMatchObject({
        text: "\uFFFCone\uFFFCtwo\uFFFCthree\uFFFCfour",
        blocks: [
          {
            type: "quote",
            parents: [],
          },
          {
            type: "paragraph",
            parents: ["quote"],
          },
          {
            type: "text",
            parents: ["quote"],
          },
          {
            type: "text",
            parents: [],
          },
        ],
        marks: [],
      });
    });

    test("multiple blocks", () => {
      expect(
        serialize(
          new TestSource({
            content: "one fishtwo fishred fishblue fish",
            annotations: [
              new Paragraph({
                start: 0,
                end: 8,
              }),
              new Paragraph({
                start: 8,
                end: 16,
              }),
              new Paragraph({
                start: 16,
                end: 24,
              }),
              new Paragraph({
                start: 24,
                end: 33,
              }),
            ],
          })
        )
      ).toMatchObject({
        text: "\uFFFCone fish\uFFFCtwo fish\uFFFCred fish\uFFFCblue fish",
        blocks: [
          {
            type: "paragraph",
            attributes: {},
          },
          {
            type: "paragraph",
            attributes: {},
          },
          {
            type: "paragraph",
            attributes: {},
          },
          {
            type: "paragraph",
            attributes: {},
          },
        ],
        marks: [],
      });
    });

    test("nested blocks", () => {
      expect(
        serialize(
          new TestSource({
            content: "one fishtwo fishred fishblue fish",
            annotations: [
              new List({
                start: 0,
                end: 33,
                attributes: {
                  type: "bulleted",
                },
              }),
              new ListItem({
                start: 0,
                end: 8,
              }),
              new ListItem({
                start: 8,
                end: 16,
              }),
              new ListItem({
                start: 16,
                end: 24,
              }),
              new ListItem({
                start: 24,
                end: 33,
              }),
            ],
          })
        )
      ).toMatchObject({
        text: "\uFFFC\uFFFCone fish\uFFFCtwo fish\uFFFCred fish\uFFFCblue fish",
        blocks: [
          {
            type: "list",
            attributes: {},
          },
          {
            type: "list-item",
            parents: ["list"],
            attributes: {},
          },
          {
            type: "list-item",
            parents: ["list"],
            attributes: {},
          },
          {
            type: "list-item",
            parents: ["list"],
            attributes: {},
          },
          {
            type: "list-item",
            parents: ["list"],
            attributes: {},
          },
        ],
        marks: [],
      });
    });
  });

  describe("marks", () => {
    test("ranges are adjusted for blocks", () => {
      expect(
        serialize(
          new TestSource({
            content: "hello, world",
            annotations: [
              new Paragraph({
                start: 0,
                end: 12,
              }),
              new Bold({
                start: 7,
                end: 12,
              }),
              new Italic({
                start: 7,
                end: 12,
              }),
            ],
          })
        )
      ).toMatchObject({
        text: "\uFFFChello, world",
        blocks: [
          {
            type: "paragraph",
            attributes: {},
          },
        ],
        marks: [
          {
            type: "bold",
            range: "(8..13]",
            attributes: {},
          },
          {
            type: "italic",
            range: "(8..13]",
            attributes: {},
          },
        ],
      });
    });

    test("ranges are encoded with custom edge behaviour", () => {
      expect(
        serialize(
          new TestSource({
            content: "hello, world",
            annotations: [
              new Paragraph({
                start: 0,
                end: 12,
              }),
              new Anchor({
                start: 7,
                end: 12,
                attributes: {
                  href: "https://www.example.com",
                },
              }),
              new Italic({
                start: 7,
                end: 12,
              }),
            ],
          })
        )
      ).toMatchObject({
        text: "\uFFFChello, world",
        blocks: [
          {
            type: "paragraph",
            attributes: {},
          },
        ],
        marks: [
          {
            type: "a",
            range: "(8..13)",
            attributes: {
              href: "https://www.example.com",
            },
          },
          {
            type: "italic",
            range: "(8..13]",
            attributes: {},
          },
        ],
      });
    });

    test("parse tokens are removed", () => {
      expect(
        serialize(
          new TestSource({
            content: "hello, \uFFFCworld\uFFFC",
            annotations: [
              new Paragraph({
                start: 0,
                end: 12,
              }),
              new ParseAnnotation({
                start: 7,
                end: 8,
              }),
              new Anchor({
                start: 7,
                end: 14,
                attributes: {
                  href: "https://www.example.com",
                },
              }),
              new Italic({
                start: 7,
                end: 14,
              }),
              new ParseAnnotation({
                start: 13,
                end: 14,
              }),
            ],
          })
        )
      ).toMatchObject({
        text: "\uFFFChello, world",
        blocks: [
          {
            type: "paragraph",
            attributes: {},
          },
        ],
        marks: [
          {
            type: "a",
            range: "(8..13)",
            attributes: {
              href: "https://www.example.com",
            },
          },
          {
            type: "italic",
            range: "(8..13]",
            attributes: {},
          },
        ],
      });
    });
  });
});

describe("deserialize", () => {
  describe("blocks", () => {
    test("single block", () => {
      expect(
        deserialize(
          {
            text: "\uFFFCHello, world",
            blocks: [
              { id: "B01", type: "paragraph", attributes: {}, parents: [] },
            ],
          },

          TestSource
        )
          .withStableIds()
          .toJSON()
      ).toMatchInlineSnapshot(`
        {
          "annotations": [
            {
              "attributes": {},
              "end": 13,
              "id": "00000001",
              "start": 0,
              "type": "-test-paragraph",
            },
            {
              "attributes": {},
              "end": 1,
              "id": "00000002",
              "start": 0,
              "type": "-atjson-parse-token",
            },
          ],
          "content": "￼Hello, world",
          "contentType": "application/vnd.atjson+test",
          "schema": [
            "-test-a",
            "-test-bold",
            "-test-code",
            "-test-image",
            "-test-instagram",
            "-test-italic",
            "-test-locale",
            "-test-line-break",
            "-test-list",
            "-test-list-item",
            "-test-manual",
            "-test-paragraph",
            "-test-pre",
            "-test-quote",
          ],
        }
      `);
    });

    test("objects", () => {
      expect(
        deserialize(
          {
            text: "Missy Elliott’s\uFFFC“Supa Dupa Fly”",
            blocks: [
              {
                id: "B01",
                type: "line-break",
                selfClosing: true,
                parents: [],
                attributes: {},
              },
            ],
          },

          TestSource
        )
          .withStableIds()
          .toJSON()
      ).toMatchInlineSnapshot(`
        {
          "annotations": [
            {
              "attributes": {},
              "end": 16,
              "id": "00000001",
              "start": 15,
              "type": "-test-line-break",
            },
            {
              "attributes": {},
              "end": 16,
              "id": "00000002",
              "start": 15,
              "type": "-atjson-parse-token",
            },
          ],
          "content": "Missy Elliott’s￼“Supa Dupa Fly”",
          "contentType": "application/vnd.atjson+test",
          "schema": [
            "-test-a",
            "-test-bold",
            "-test-code",
            "-test-image",
            "-test-instagram",
            "-test-italic",
            "-test-locale",
            "-test-line-break",
            "-test-list",
            "-test-list-item",
            "-test-manual",
            "-test-paragraph",
            "-test-pre",
            "-test-quote",
          ],
        }
      `);
    });
  });
});
