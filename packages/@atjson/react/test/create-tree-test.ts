import { createTree } from "../src/utils";

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
        })
      ).toMatchInlineSnapshot(`
        {
          "root": [
            "Hello, world",
          ],
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
        })
      ).toMatchInlineSnapshot(`
        {
          "M0": [
            "Hello",
          ],
          "root": [
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
        })
      ).toMatchInlineSnapshot(`
        {
          "M1": [
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
          "M1-M0": [
            "Hello",
          ],
          "root": [
            {
              "attributes": {},
              "end": 13,
              "id": "M1",
              "range": "[1..13)",
              "start": 1,
              "type": "bold",
            },
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
        })
      ).toMatchInlineSnapshot(`
        {
          "M1": [
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
          "M1-M0": [
            "world",
          ],
          "root": [
            {
              "attributes": {},
              "end": 13,
              "id": "M1",
              "range": "[1..13)",
              "start": 1,
              "type": "bold",
            },
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
        })
      ).toMatchInlineSnapshot(`
        {
          "M1": [
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
          "M1-M0": [
            "o",
          ],
          "root": [
            {
              "attributes": {},
              "end": 13,
              "id": "M1",
              "range": "[1..13)",
              "start": 1,
              "type": "bold",
            },
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
        })
      ).toMatchInlineSnapshot(`
        {
          "M0": [
            {
              "attributes": {},
              "end": 6,
              "id": "M0-M1",
              "range": "[1..6)",
              "start": 1,
              "type": "bold",
            },
          ],
          "M0-M1": [
            "Hello",
          ],
          "root": [
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
        })
      ).toMatchInlineSnapshot(`
        {
          "M0": [
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
          "M0-M1": [
            "and",
          ],
          "M1": [
            " italic",
          ],
          "root": [
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
        })
      ).toMatchInlineSnapshot(`
        {
          "root": [
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
        })
      ).toMatchInlineSnapshot(`
        {
          "B0": [
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
          "B1": [
            "one fish",
          ],
          "B2": [
            "two fish",
          ],
          "B3": [
            "red fish",
          ],
          "B4": [
            "blue fish",
          ],
          "root": [
            {
              "attributes": {},
              "id": "B0",
              "parents": [],
              "selfClosing": false,
              "type": "list",
            },
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
        })
      ).toMatchInlineSnapshot(`
        {
          "B0": [
            "one fish",
          ],
          "B1": [
            "two fish",
          ],
          "B2": [
            "red fish",
          ],
          "B3": [
            "blue fish",
          ],
          "root": [
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
        })
      ).toMatchInlineSnapshot(`
        {
          "B0": [
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
          "B1": [
            "two",
          ],
          "root": [
            {
              "attributes": {},
              "id": "B0",
              "parents": [],
              "selfClosing": false,
              "type": "quote",
            },
            "four",
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
        })
      ).toMatchInlineSnapshot(`
        {
          "B1": [
            "two",
          ],
          "root": [
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
        }
      `);
    });
  });
});
