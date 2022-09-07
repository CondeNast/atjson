import { ParseAnnotation, serialize } from "@atjson/document";
import TestSource, {
  Anchor,
  Paragraph,
  Bold,
  Italic,
  List,
  ListItem,
  LineBreak,
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
        text: "Missy Elliott’s\uFFFC“Supa Dupa Fly”",
        blocks: [
          {
            type: "line-break",
            attributes: {},
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
      let list = new List({
        start: 0,
        end: 33,
        attributes: {
          type: "bulleted",
        },
      });
      expect(
        serialize(
          new TestSource({
            content: "one fishtwo fishred fishblue fish",
            annotations: [
              list,
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
            id: list.id,
            type: "list",
            attributes: {},
          },
          {
            type: "list-item",
            parent: list.id,
            attributes: {},
          },
          {
            type: "list-item",
            parent: list.id,
            attributes: {},
          },
          {
            type: "list-item",
            parent: list.id,
            attributes: {},
          },
          {
            type: "list-item",
            parent: list.id,
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
