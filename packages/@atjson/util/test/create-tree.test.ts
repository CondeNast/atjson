import { createTree } from "../src";

describe("createTree", () => {
  describe("marks", () => {
    test("plain text document", () => {
      expect(
        createTree({
          text: "\uFFFCHello, world",
          blocks: [
            {
              id: "B0",
              type: "text",
              parents: [],
              selfClosing: false,
              attributes: {},
            },
          ],

          marks: [],
        }),
      ).toMatchInlineSnapshot(`
        Map {
          "root" => [
            "Hello, world",
          ],
        }
      `);
    });

    test("zero-length marks", () => {
      expect(
        createTree({
          text: "\uFFFCa",
          blocks: [
            {
              id: "B0",
              type: "text",
              parents: [],
              selfClosing: false,
              attributes: {},
            },
          ],

          marks: [
            {
              id: "M0",
              type: "italic",
              start: 2,
              end: 2,
              range: "[2..2)",
              attributes: {},
            },
          ],
        }),
      ).toMatchInlineSnapshot(`
        Map {
          "root" => [
            "a",
            {
              "attributes": {},
              "end": 2,
              "id": "M0",
              "range": "[2..2)",
              "start": 2,
              "type": "italic",
            },
          ],
          "M0" => [],
        }
      `);
    });

    test("zero-length marks at the start of a block", () => {
      expect(
        createTree({
          text: "\uFFFC",
          blocks: [
            {
              id: "B0",
              type: "text",
              parents: [],
              selfClosing: false,
              attributes: {},
            },
          ],

          marks: [
            {
              id: "M0",
              type: "italic",
              start: 1,
              end: 1,
              range: "[1..1)",
              attributes: {},
            },
          ],
        }),
      ).toMatchInlineSnapshot(`
        Map {
          "root" => [
            {
              "attributes": {},
              "end": 1,
              "id": "M0",
              "range": "[1..1)",
              "start": 1,
              "type": "italic",
            },
          ],
          "M0" => [],
        }
      `);
    });

    test("plain text with marks", () => {
      expect(
        createTree({
          text: "\uFFFCHello, world",
          blocks: [
            {
              id: "B0",
              type: "text",
              parents: [],
              selfClosing: false,
              attributes: {},
            },
          ],

          marks: [
            {
              id: "M0",
              type: "italic",
              start: 1,
              end: 6,
              range: "[1..6)",
              attributes: {},
            },
          ],
        }),
      ).toMatchInlineSnapshot(`
        Map {
          "root" => [
            {
              "attributes": {},
              "end": 6,
              "id": "M0",
              "range": "[1..6)",
              "start": 1,
              "type": "italic",
            },
            ", world",
          ],
          "M0" => [
            "Hello",
          ],
        }
      `);
    });

    test("start-aligned nested marks", () => {
      expect(
        createTree({
          text: "\uFFFCHello, world",
          blocks: [
            {
              id: "B0",
              type: "text",
              parents: [],
              selfClosing: false,
              attributes: {},
            },
          ],

          marks: [
            {
              id: "M0",
              type: "italic",
              start: 1,
              end: 6,
              range: "[1..6)",
              attributes: {},
            },
            {
              id: "M1",
              type: "bold",
              start: 1,
              end: 13,
              range: "[1..13)",
              attributes: {},
            },
          ],
        }),
      ).toMatchInlineSnapshot(`
        Map {
          "root" => [
            {
              "attributes": {},
              "end": 13,
              "id": "M1",
              "range": "[1..13)",
              "start": 1,
              "type": "bold",
            },
          ],
          "M1" => [
            {
              "attributes": {},
              "end": 6,
              "id": "M1-M0",
              "range": "[1..6)",
              "start": 1,
              "type": "italic",
            },
            ", world",
          ],
          "M1-M0" => [
            "Hello",
          ],
        }
      `);
    });

    test("end-aligned nested marks", () => {
      expect(
        createTree({
          text: "\uFFFCHello, world",
          blocks: [
            {
              id: "B0",
              type: "text",
              parents: [],
              selfClosing: false,
              attributes: {},
            },
          ],

          marks: [
            {
              id: "M0",
              type: "italic",
              start: 8,
              end: 13,
              range: "[8..13)",
              attributes: {},
            },
            {
              id: "M1",
              type: "bold",
              start: 1,
              end: 13,
              range: "[1..13)",
              attributes: {},
            },
          ],
        }),
      ).toMatchInlineSnapshot(`
        Map {
          "root" => [
            {
              "attributes": {},
              "end": 13,
              "id": "M1",
              "range": "[1..13)",
              "start": 1,
              "type": "bold",
            },
          ],
          "M1" => [
            "Hello, ",
            {
              "attributes": {},
              "end": 13,
              "id": "M1-M0",
              "range": "[8..13)",
              "start": 8,
              "type": "italic",
            },
          ],
          "M1-M0" => [
            "world",
          ],
        }
      `);
    });

    test("nested marks", () => {
      expect(
        createTree({
          text: "\uFFFCHello, world",
          blocks: [
            {
              id: "B0",
              type: "text",
              parents: [],
              selfClosing: false,
              attributes: {},
            },
          ],

          marks: [
            {
              id: "M0",
              type: "italic",
              start: 5,
              end: 6,
              range: "[5..6)",
              attributes: {},
            },
            {
              id: "M1",
              type: "bold",
              start: 1,
              end: 13,
              range: "[1..13)",
              attributes: {},
            },
          ],
        }),
      ).toMatchInlineSnapshot(`
        Map {
          "root" => [
            {
              "attributes": {},
              "end": 13,
              "id": "M1",
              "range": "[1..13)",
              "start": 1,
              "type": "bold",
            },
          ],
          "M1" => [
            "Hell",
            {
              "attributes": {},
              "end": 6,
              "id": "M1-M0",
              "range": "[5..6)",
              "start": 5,
              "type": "italic",
            },
            ", world",
          ],
          "M1-M0" => [
            "o",
          ],
        }
      `);
    });

    test("contiguous marks", () => {
      expect(
        createTree({
          text: "\uFFFCHello, world",
          blocks: [
            {
              id: "B0",
              type: "text",
              parents: [],
              selfClosing: false,
              attributes: {},
            },
          ],

          marks: [
            {
              id: "M0",
              type: "italic",
              start: 1,
              end: 6,
              range: "[1..6)",
              attributes: {},
            },
            {
              id: "M1",
              type: "bold",
              start: 1,
              end: 6,
              range: "[1..6)",
              attributes: {},
            },
          ],
        }),
      ).toMatchInlineSnapshot(`
        Map {
          "root" => [
            {
              "attributes": {},
              "end": 6,
              "id": "M0",
              "range": "[1..6)",
              "start": 1,
              "type": "italic",
            },
            ", world",
          ],
          "M0" => [
            {
              "attributes": {},
              "end": 6,
              "id": "M0-M1",
              "range": "[1..6)",
              "start": 1,
              "type": "bold",
            },
          ],
          "M0-M1" => [
            "Hello",
          ],
        }
      `);
    });

    test("adjacent marks", () => {
      expect(
        createTree({
          text: "\uFFFCHello, world",
          blocks: [
            {
              id: "B0",
              type: "text",
              parents: [],
              selfClosing: false,
              attributes: {},
            },
          ],

          marks: [
            {
              id: "M0",
              type: "bold",
              start: 1,
              end: 6,
              range: "[1..6)",
              attributes: {},
            },
            {
              id: "M1",
              type: "italic",
              start: 6,
              end: 13,
              range: "[6..13)",
              attributes: {},
            },
          ],
        }),
      ).toMatchInlineSnapshot(`
        Map {
          "root" => [
            {
              "attributes": {},
              "end": 6,
              "id": "M0",
              "range": "[1..6)",
              "start": 1,
              "type": "bold",
            },
            {
              "attributes": {},
              "end": 13,
              "id": "M1",
              "range": "[6..13)",
              "start": 6,
              "type": "italic",
            },
          ],
          "M0" => [
            "Hello",
          ],
          "M1" => [
            ", world",
          ],
        }
      `);
    });

    test("overlapping marks", () => {
      expect(
        createTree({
          text: "\uFFFCbold and italic",
          blocks: [
            {
              id: "B0",
              type: "text",
              parents: [],
              selfClosing: false,
              attributes: {},
            },
          ],

          marks: [
            {
              id: "M0",
              type: "bold",
              start: 1,
              end: 9,
              range: "[1..9)",
              attributes: {},
            },
            {
              id: "M1",
              type: "italic",
              start: 6,
              end: 16,
              range: "[6..16)",
              attributes: {},
            },
          ],
        }),
      ).toMatchInlineSnapshot(`
        Map {
          "root" => [
            {
              "attributes": {},
              "end": 9,
              "id": "M0",
              "range": "[1..9)",
              "start": 1,
              "type": "bold",
            },
            {
              "attributes": {},
              "end": 16,
              "id": "M1",
              "range": "[6..16)",
              "start": 6,
              "type": "italic",
            },
          ],
          "M0" => [
            "bold ",
            {
              "attributes": {},
              "end": 16,
              "id": "M0-M1",
              "range": "[6..16)",
              "start": 6,
              "type": "italic",
            },
          ],
          "M0-M1" => [
            "and",
          ],
          "M1" => [
            " italic",
          ],
        }
      `);
    });

    test("self-closing blocks in marks", () => {
      expect(
        createTree({
          text: "\uFFFCone\uFFFCtwo",
          blocks: [
            {
              id: "B0",
              type: "text",
              parents: [],
              selfClosing: false,
              attributes: {},
            },
            {
              id: "B1",
              type: "line-break",
              parents: ["text"],
              selfClosing: true,
              attributes: {},
            },
          ],

          marks: [
            {
              id: "M0",
              type: "bold",
              start: 1,
              end: 8,
              range: "[1..8)",
              attributes: {},
            },
          ],
        }),
      ).toMatchInlineSnapshot(`
        Map {
          "root" => [
            {
              "attributes": {},
              "end": 8,
              "id": "M0",
              "range": "[1..8)",
              "start": 1,
              "type": "bold",
            },
          ],
          "M0" => [
            "one",
            {
              "attributes": {},
              "id": "B1",
              "parents": [
                "text",
              ],
              "selfClosing": true,
              "type": "line-break",
            },
            "two",
          ],
        }
      `);
    });
  });

  describe("blocks", () => {
    test("selfClosing blocks", () => {
      expect(
        createTree({
          text: "\uFFFCHello,\uFFFCworld",
          blocks: [
            {
              id: "B0",
              type: "text",
              parents: [],
              selfClosing: false,
              attributes: {},
            },
            {
              id: "B1",
              type: "line-break",
              parents: ["text"],
              selfClosing: true,
              attributes: {},
            },
          ],

          marks: [],
        }),
      ).toMatchInlineSnapshot(`
        Map {
          "root" => [
            "Hello,",
            {
              "attributes": {},
              "id": "B1",
              "parents": [
                "text",
              ],
              "selfClosing": true,
              "type": "line-break",
            },
            "world",
          ],
        }
      `);
    });

    test("nested blocks", () => {
      expect(
        createTree({
          text: "\uFFFC\uFFFCone fish\uFFFCtwo fish\uFFFCred fish\uFFFCblue fish",
          blocks: [
            {
              id: "B0",
              type: "list",
              parents: [],
              selfClosing: false,
              attributes: {},
            },
            {
              id: "B1",
              type: "list-item",
              parents: ["list"],
              selfClosing: false,
              attributes: {},
            },
            {
              id: "B2",
              type: "list-item",
              parents: ["list"],
              selfClosing: false,
              attributes: {},
            },
            {
              id: "B3",
              type: "list-item",
              parents: ["list"],
              selfClosing: false,
              attributes: {},
            },
            {
              id: "B4",
              type: "list-item",
              parents: ["list"],
              selfClosing: false,
              attributes: {},
            },
          ],

          marks: [],
        }),
      ).toMatchInlineSnapshot(`
        Map {
          "root" => [
            {
              "attributes": {},
              "id": "B0",
              "parents": [],
              "selfClosing": false,
              "type": "list",
            },
          ],
          "B0" => [
            {
              "attributes": {},
              "id": "B1",
              "parents": [
                "list",
              ],
              "selfClosing": false,
              "type": "list-item",
            },
            {
              "attributes": {},
              "id": "B2",
              "parents": [
                "list",
              ],
              "selfClosing": false,
              "type": "list-item",
            },
            {
              "attributes": {},
              "id": "B3",
              "parents": [
                "list",
              ],
              "selfClosing": false,
              "type": "list-item",
            },
            {
              "attributes": {},
              "id": "B4",
              "parents": [
                "list",
              ],
              "selfClosing": false,
              "type": "list-item",
            },
          ],
          "B1" => [
            "one fish",
          ],
          "B2" => [
            "two fish",
          ],
          "B3" => [
            "red fish",
          ],
          "B4" => [
            "blue fish",
          ],
        }
      `);
    });

    test("nested blocks with marks", () => {
      expect(
        createTree({
          text: "\uFFFC\uFFFCone fish\uFFFCtwo fish\uFFFCred fish\uFFFCblue fish",
          blocks: [
            {
              id: "B0",
              type: "list",
              parents: [],
              selfClosing: false,
              attributes: {},
            },
            {
              id: "B1",
              type: "list-item",
              parents: ["list"],
              selfClosing: false,
              attributes: {},
            },
            {
              id: "B2",
              type: "list-item",
              parents: ["list"],
              selfClosing: false,
              attributes: {},
            },
            {
              id: "B3",
              type: "list-item",
              parents: ["list"],
              selfClosing: false,
              attributes: {},
            },
            {
              id: "B4",
              type: "list-item",
              parents: ["list"],
              selfClosing: false,
              attributes: {},
            },
          ],

          marks: [
            {
              id: "M0",
              type: "color",
              start: 20,
              end: 23,
              range: "[20..23)",
              attributes: { color: "red" },
            },
            {
              id: "M1",
              type: "color",
              start: 29,
              end: 33,
              range: "[29..33)",
              attributes: { color: "blue" },
            },
          ],
        }),
      ).toMatchInlineSnapshot(`
        Map {
          "root" => [
            {
              "attributes": {},
              "id": "B0",
              "parents": [],
              "selfClosing": false,
              "type": "list",
            },
          ],
          "B0" => [
            {
              "attributes": {},
              "id": "B1",
              "parents": [
                "list",
              ],
              "selfClosing": false,
              "type": "list-item",
            },
            {
              "attributes": {},
              "id": "B2",
              "parents": [
                "list",
              ],
              "selfClosing": false,
              "type": "list-item",
            },
            {
              "attributes": {},
              "id": "B3",
              "parents": [
                "list",
              ],
              "selfClosing": false,
              "type": "list-item",
            },
            {
              "attributes": {},
              "id": "B4",
              "parents": [
                "list",
              ],
              "selfClosing": false,
              "type": "list-item",
            },
          ],
          "B1" => [
            "one fish",
          ],
          "B2" => [
            "two fish",
          ],
          "B3" => [
            {
              "attributes": {
                "color": "red",
              },
              "end": 23,
              "id": "B3-M0",
              "range": "[20..23)",
              "start": 20,
              "type": "color",
            },
            " fish",
          ],
          "B3-M0" => [
            "red",
          ],
          "B4" => [
            {
              "attributes": {
                "color": "blue",
              },
              "end": 33,
              "id": "B4-M1",
              "range": "[29..33)",
              "start": 29,
              "type": "color",
            },
            " fish",
          ],
          "B4-M1" => [
            "blue",
          ],
        }
      `);
    });

    test("multiple blocks", () => {
      expect(
        createTree({
          text: "\uFFFCone fish\uFFFCtwo fish\uFFFCred fish\uFFFCblue fish",
          blocks: [
            {
              id: "B0",
              type: "paragraph",
              parents: [],
              selfClosing: false,
              attributes: {},
            },
            {
              id: "B1",
              type: "paragraph",
              parents: [],
              selfClosing: false,
              attributes: {},
            },
            {
              id: "B2",
              type: "paragraph",
              parents: [],
              selfClosing: false,
              attributes: {},
            },
            {
              id: "B3",
              type: "paragraph",
              parents: [],
              selfClosing: false,
              attributes: {},
            },
          ],

          marks: [],
        }),
      ).toMatchInlineSnapshot(`
        Map {
          "root" => [
            {
              "attributes": {},
              "id": "B0",
              "parents": [],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B1",
              "parents": [],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B2",
              "parents": [],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B3",
              "parents": [],
              "selfClosing": false,
              "type": "paragraph",
            },
          ],
          "B0" => [
            "one fish",
          ],
          "B1" => [
            "two fish",
          ],
          "B2" => [
            "red fish",
          ],
          "B3" => [
            "blue fish",
          ],
        }
      `);
    });

    test("block continuations", () => {
      expect(
        createTree({
          text: "\uFFFCone\uFFFCtwo\uFFFCthree\uFFFCfour",
          blocks: [
            {
              id: "B0",
              type: "quote",
              parents: [],
              selfClosing: false,
              attributes: {},
            },
            {
              id: "B1",
              type: "paragraph",
              parents: ["quote"],
              selfClosing: false,
              attributes: {},
            },
            {
              id: "B2",
              type: "text",
              parents: ["quote"],
              selfClosing: false,
              attributes: {},
            },
            {
              id: "B3",
              type: "text",
              parents: [],
              selfClosing: false,
              attributes: {},
            },
          ],

          marks: [],
        }),
      ).toMatchInlineSnapshot(`
        Map {
          "root" => [
            {
              "attributes": {},
              "id": "B0",
              "parents": [],
              "selfClosing": false,
              "type": "quote",
            },
            "four",
          ],
          "B0" => [
            "one",
            {
              "attributes": {},
              "id": "B1",
              "parents": [
                "quote",
              ],
              "selfClosing": false,
              "type": "paragraph",
            },
            "three",
          ],
          "B1" => [
            "two",
          ],
        }
      `);
    });

    test("sparse blocks", () => {
      expect(
        createTree({
          text: "\uFFFCone\uFFFCtwo\uFFFCthree",
          blocks: [
            {
              id: "B0",
              type: "text",
              parents: [],
              selfClosing: false,
              attributes: {},
            },
            {
              id: "B1",
              type: "paragraph",
              parents: ["text"],
              selfClosing: false,
              attributes: {},
            },
            {
              id: "B2",
              type: "text",
              parents: [],
              selfClosing: false,
              attributes: {},
            },
          ],

          marks: [],
        }),
      ).toMatchInlineSnapshot(`
        Map {
          "root" => [
            "one",
            {
              "attributes": {},
              "id": "B1",
              "parents": [
                "text",
              ],
              "selfClosing": false,
              "type": "paragraph",
            },
            "three",
          ],
          "B1" => [
            "two",
          ],
        }
      `);
    });

    test("multiple self-closing blocks", () => {
      expect(
        createTree({
          text: "\uFFFCone\uFFFCtwo\uFFFCthree\uFFFCfour\uFFFCfive\uFFFCsix\uFFFCseven",
          blocks: [
            {
              id: "B0",
              type: "paragraph",
              parents: [],
              selfClosing: false,
              attributes: {},
            },
            {
              id: "B1",
              type: "line-break",
              parents: ["paragraph"],
              selfClosing: true,
              attributes: {},
            },
            {
              id: "B2",
              type: "line-break",
              parents: ["paragraph"],
              selfClosing: true,
              attributes: {},
            },
            {
              id: "B3",
              type: "line-break",
              parents: ["paragraph"],
              selfClosing: true,
              attributes: {},
            },
            {
              id: "B4",
              type: "paragraph",
              parents: [],
              selfClosing: false,
              attributes: {},
            },
            {
              id: "B5",
              type: "line-break",
              parents: ["paragraph"],
              selfClosing: true,
              attributes: {},
            },
            {
              id: "B6",
              type: "line-break",
              parents: ["paragraph"],
              selfClosing: true,
              attributes: {},
            },
          ],

          marks: [],
        }),
      ).toMatchInlineSnapshot(`
        Map {
          "root" => [
            {
              "attributes": {},
              "id": "B0",
              "parents": [],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B4",
              "parents": [],
              "selfClosing": false,
              "type": "paragraph",
            },
          ],
          "B0" => [
            "one",
            {
              "attributes": {},
              "id": "B1",
              "parents": [
                "paragraph",
              ],
              "selfClosing": true,
              "type": "line-break",
            },
            "two",
            {
              "attributes": {},
              "id": "B2",
              "parents": [
                "paragraph",
              ],
              "selfClosing": true,
              "type": "line-break",
            },
            "three",
            {
              "attributes": {},
              "id": "B3",
              "parents": [
                "paragraph",
              ],
              "selfClosing": true,
              "type": "line-break",
            },
            "four",
          ],
          "B4" => [
            "five",
            {
              "attributes": {},
              "id": "B5",
              "parents": [
                "paragraph",
              ],
              "selfClosing": true,
              "type": "line-break",
            },
            "six",
            {
              "attributes": {},
              "id": "B6",
              "parents": [
                "paragraph",
              ],
              "selfClosing": true,
              "type": "line-break",
            },
            "seven",
          ],
        }
      `);
    });

    test("marks across blocks", () => {
      expect(
        createTree({
          text: "\uFFFCone two\uFFFCthree four",
          blocks: [
            {
              id: "B0",
              type: "paragraph",
              parents: [],
              selfClosing: false,
              attributes: {},
            },
            {
              id: "B1",
              type: "paragraph",
              parents: [],
              selfClosing: false,
              attributes: {},
            },
          ],

          marks: [
            {
              id: "M1",
              type: "bold",
              start: 5,
              end: 14,
              range: "[5..14)",
              attributes: {},
            },
          ],
        }),
      ).toMatchInlineSnapshot(`
        Map {
          "root" => [
            {
              "attributes": {},
              "id": "B0",
              "parents": [],
              "selfClosing": false,
              "type": "paragraph",
            },
            {
              "attributes": {},
              "id": "B1",
              "parents": [],
              "selfClosing": false,
              "type": "paragraph",
            },
          ],
          "B0" => [
            "one ",
            {
              "attributes": {},
              "end": 14,
              "id": "B0-M1",
              "range": "[5..14)",
              "start": 5,
              "type": "bold",
            },
          ],
          "B0-M1" => [
            "two",
          ],
          "B1" => [
            {
              "attributes": {},
              "end": 14,
              "id": "B1-M1",
              "range": "[5..14)",
              "start": 5,
              "type": "bold",
            },
            " four",
          ],
          "B1-M1" => [
            "three",
          ],
        }
      `);
    });
  });
});
