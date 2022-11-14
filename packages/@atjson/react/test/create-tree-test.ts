import { createTree } from "../src/utils";

describe("createTree", () => {
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
