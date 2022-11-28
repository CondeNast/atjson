import {
  ParseAnnotation,
  deserialize,
  serialize,
  UnknownAnnotation,
  is,
} from "../src";
import TestSource, {
  Anchor,
  Paragraph,
  Bold,
  Italic,
  List,
  ListItem,
  LineBreak,
  Quote,
  Instagram,
} from "./test-source";

describe("serialize", () => {
  test("errors are thrown if uFFFC is included in text", () => {
    expect(() => {
      serialize(
        new TestSource({
          content:
            "<p>There's text that wasn't wrapped in a ParseAnnotation!</p>\uFFFC",
          annotations: [
            new ParseAnnotation({
              start: 0,
              end: 3,
            }),

            new Paragraph({
              start: 0,
              end: 61,
            }),

            new ParseAnnotation({
              start: 57,
              end: 61,
            }),

            new Instagram({
              start: 61,
              end: 62,
            }),
          ],
        })
      );
    }).toThrowErrorMatchingInlineSnapshot(`
      "Text contains reserved character +uFFFC at index 61.

      in a ParseAnnotation!</p>￼
                               ^"
    `);
  });

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

    test("colinear marks & blocks", () => {
      expect(
        serialize(
          new TestSource({
            content: "Hello, world",
            annotations: [
              new Paragraph({
                start: 0,
                end: 12,
              }),
              new Italic({
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
        marks: [
          {
            type: "italic",
          },
        ],
      });
    });

    test("colinear marks", () => {
      expect(
        serialize(
          new TestSource({
            content: "Hello, world",
            annotations: [
              new Paragraph({
                start: 0,
                end: 12,
              }),
              new Italic({
                start: 0,
                end: 12,
              }),
              new Bold({
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
        marks: [
          {
            type: "bold",
            range: "(1..13]",
          },
          {
            type: "italic",
            range: "(1..13]",
          },
        ],
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
    
    test("jagged list", () => {
      let doc = new TestSource({
        content: "one\ntwo",
        annotations: [
          new List({
            start: 0,
            end: 7,
            attributes: {
              type: "bulleted",
            },
          }),
          new ListItem({ start: 0, end: 3 }),
          new ListItem({ start: 4, end: 7 }),
        ],
      });

      expect(serialize(doc, { withStableIds: true })).toMatchInlineSnapshot(`
        {
          "blocks": [
            {
              "attributes": {
                "type": "bulleted",
              },
              "id": "B00000000",
              "parents": [],
              "selfClosing": false,
              "type": "list",
            },
            {
              "attributes": {},
              "id": "B00000001",
              "parents": [
                "list",
              ],
              "selfClosing": false,
              "type": "list-item",
            },
            {
              "attributes": {},
              "id": "B00000002",
              "parents": [
                "list",
              ],
              "selfClosing": false,
              "type": "text",
            },
            {
              "attributes": {},
              "id": "B00000003",
              "parents": [
                "list",
              ],
              "selfClosing": false,
              "type": "list-item",
            },
          ],
          "marks": [],
          "text": "￼￼one￼
        ￼two",
        }
      `);
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

    test("unknown marks", () => {
      expect(
        serialize(
          new TestSource({
            content: "Hello, world",
            annotations: [
              new Paragraph({
                start: 0,
                end: 12,
              }),
              new UnknownAnnotation({
                start: 8,
                end: 12,
                attributes: {
                  type: "subscript",
                  attributes: {},
                },
              }),
            ],
          })
        )
      ).toMatchObject({
        text: "\uFFFCHello, world",
        blocks: [
          {
            type: "paragraph",
          },
        ],
        marks: [{ type: "subscript", range: "(9..13]" }],
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

    describe("parse tokens", () => {
      test("range shifting", () => {
        expect(
          serialize(
            new TestSource({
              content: "hello, \uFFFCworld\uFFFC",
              annotations: [
                new Paragraph({
                  start: 0,
                  end: 14,
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

      test("text block insertion", () => {
        expect(
          serialize(
            new TestSource({
              content: "\uFFFChello, world",
              annotations: [
                new Paragraph({
                  start: 1,
                  end: 13,
                }),
                new ParseAnnotation({
                  start: 0,
                  end: 1,
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
          marks: [],
        });
      });

      test("text block insertion", () => {
        expect(
          serialize(
            new TestSource({
              content: "\uFFFChello, world\uFFFChi",
              annotations: [
                new Paragraph({
                  start: 1,
                  end: 13,
                }),
                new ParseAnnotation({
                  start: 0,
                  end: 1,
                }),
                new ParseAnnotation({
                  start: 13,
                  end: 14,
                }),
              ],
            })
          )
        ).toMatchObject({
          text: "\uFFFChello, world\uFFFChi",
          blocks: [
            {
              type: "paragraph",
              attributes: {},
            },
            {
              type: "text",
              attributes: {},
            },
          ],
          marks: [],
        });
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

    test("nested blocks", () => {
      expect(
        deserialize(
          {
            text: "\uFFFC\uFFFC\uFFFCone fish\uFFFC\uFFFCtwo fish\uFFFC\uFFFCred fish\uFFFC\uFFFCblue fish",
            blocks: [
              {
                id: "B01",
                type: "list",
                selfClosing: false,
                parents: [],
                attributes: {},
              },
              {
                id: "B02",
                type: "list-item",
                selfClosing: false,
                parents: ["list"],
                attributes: {},
              },
              {
                id: "B03",
                type: "paragraph",
                selfClosing: false,
                parents: ["list", "list-item"],
                attributes: {},
              },
              {
                id: "B04",
                type: "list-item",
                selfClosing: false,
                parents: ["list"],
                attributes: {},
              },
              {
                id: "B05",
                type: "paragraph",
                selfClosing: false,
                parents: ["list", "list-item"],
                attributes: {},
              },
              {
                id: "B06",
                type: "list-item",
                selfClosing: false,
                parents: ["list"],
                attributes: {},
              },
              {
                id: "B07",
                type: "paragraph",
                selfClosing: false,
                parents: ["list", "list-item"],
                attributes: {},
              },
              {
                id: "B08",
                type: "list-item",
                selfClosing: false,
                parents: ["list"],
                attributes: {},
              },
              {
                id: "B09",
                type: "paragraph",
                selfClosing: false,
                parents: ["list", "list-item"],
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
              "end": 42,
              "id": "00000001",
              "start": 0,
              "type": "-test-list",
            },
            {
              "attributes": {},
              "end": 1,
              "id": "00000002",
              "start": 0,
              "type": "-atjson-parse-token",
            },
            {
              "attributes": {},
              "end": 11,
              "id": "00000003",
              "start": 1,
              "type": "-test-list-item",
            },
            {
              "attributes": {},
              "end": 2,
              "id": "00000004",
              "start": 1,
              "type": "-atjson-parse-token",
            },
            {
              "attributes": {},
              "end": 11,
              "id": "00000005",
              "start": 2,
              "type": "-test-paragraph",
            },
            {
              "attributes": {},
              "end": 3,
              "id": "00000006",
              "start": 2,
              "type": "-atjson-parse-token",
            },
            {
              "attributes": {},
              "end": 21,
              "id": "00000007",
              "start": 11,
              "type": "-test-list-item",
            },
            {
              "attributes": {},
              "end": 12,
              "id": "00000008",
              "start": 11,
              "type": "-atjson-parse-token",
            },
            {
              "attributes": {},
              "end": 21,
              "id": "00000009",
              "start": 12,
              "type": "-test-paragraph",
            },
            {
              "attributes": {},
              "end": 13,
              "id": "0000000a",
              "start": 12,
              "type": "-atjson-parse-token",
            },
            {
              "attributes": {},
              "end": 31,
              "id": "0000000b",
              "start": 21,
              "type": "-test-list-item",
            },
            {
              "attributes": {},
              "end": 22,
              "id": "0000000c",
              "start": 21,
              "type": "-atjson-parse-token",
            },
            {
              "attributes": {},
              "end": 31,
              "id": "0000000d",
              "start": 22,
              "type": "-test-paragraph",
            },
            {
              "attributes": {},
              "end": 23,
              "id": "0000000e",
              "start": 22,
              "type": "-atjson-parse-token",
            },
            {
              "attributes": {},
              "end": 42,
              "id": "0000000f",
              "start": 31,
              "type": "-test-list-item",
            },
            {
              "attributes": {},
              "end": 32,
              "id": "00000010",
              "start": 31,
              "type": "-atjson-parse-token",
            },
            {
              "attributes": {},
              "end": 42,
              "id": "00000011",
              "start": 32,
              "type": "-test-paragraph",
            },
            {
              "attributes": {},
              "end": 33,
              "id": "00000012",
              "start": 32,
              "type": "-atjson-parse-token",
            },
          ],
          "content": "￼￼￼one fish￼￼two fish￼￼red fish￼￼blue fish",
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

    test("unknown blocks", () => {
      let doc = deserialize(
        {
          text: "\uFFFChello",
          blocks: [
            {
              id: "B01",
              type: "blockquote",
              selfClosing: false,
              parents: [],
              attributes: {
                align: "left",
              },
            },
          ],
        },
        TestSource
      );
      let unknown = [...doc.where((a) => is(a, UnknownAnnotation))];
      expect(unknown.length).toBe(1);
      expect(unknown[0].attributes).toMatchObject({
        type: "blockquote",
        attributes: { align: "left" },
      });
    });

    test("unknown marks", () => {
      let doc = deserialize(
        {
          text: "\uFFFChello",
          blocks: [
            {
              id: "B01",
              type: "paragraph",
              selfClosing: false,
              parents: [],
              attributes: {},
            },
          ],
          marks: [
            {
              id: "M01",
              type: "internalLink",
              range: "[1..6]",
              attributes: {
                urn: "foo",
              },
            },
          ],
        },
        TestSource
      );
      let unknown = [...doc.where((a) => is(a, UnknownAnnotation))];
      expect(unknown.length).toBe(1);
      expect(unknown[0].attributes).toMatchObject({
        type: "internalLink",
        attributes: { urn: "foo" },
      });
    });

    test("jagged blocks", () => {
      expect(
        deserialize(
          {
            text: "\uFFFC\uFFFCone\uFFFCtwo",
            blocks: [
              {
                id: "B01",
                type: "quote",
                selfClosing: false,
                parents: [],
                attributes: {},
              },
              {
                id: "B02",
                type: "paragraph",
                selfClosing: false,
                parents: ["quote"],
                attributes: {},
              },
              {
                id: "B03",
                type: "paragraph",
                selfClosing: false,
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
              "end": 5,
              "id": "00000001",
              "start": 0,
              "type": "-test-quote",
            },
            {
              "attributes": {},
              "end": 1,
              "id": "00000002",
              "start": 0,
              "type": "-atjson-parse-token",
            },
            {
              "attributes": {},
              "end": 5,
              "id": "00000003",
              "start": 1,
              "type": "-test-paragraph",
            },
            {
              "attributes": {},
              "end": 2,
              "id": "00000004",
              "start": 1,
              "type": "-atjson-parse-token",
            },
            {
              "attributes": {},
              "end": 9,
              "id": "00000005",
              "start": 5,
              "type": "-test-paragraph",
            },
            {
              "attributes": {},
              "end": 6,
              "id": "00000006",
              "start": 5,
              "type": "-atjson-parse-token",
            },
          ],
          "content": "￼￼one￼two",
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

    test("malformed ranges throw errors", () => {
      expect(() =>
        deserialize(
          {
            text: "\uFFFCoops",
            blocks: [
              {
                id: "B01",
                type: "paragraph",
                selfClosing: false,
                parents: [],
                attributes: {},
              },
            ],
            marks: [
              {
                id: "M01",
                type: "error",
                // @ts-expect-error We're testing malformed ranges
                range: "{1..3]",
                attributes: {},
              },
            ],
          },
          TestSource
        )
      ).toThrowError();
    });
  });
});
