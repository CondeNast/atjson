import { extractSlices } from "../src";

describe("extractSlices", () => {
  test("no slices", () => {
    let original = {
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
    };
    let [doc, slices] = extractSlices(original);
    expect(doc).toMatchObject(original);
    expect(slices).toMatchObject({});
  });

  test("retained slices", () => {
    let original = {
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
          type: "slice",
          range: "[0..13]",
          attributes: {
            retain: true,
          },
        },
      ],
    };
    let [doc, slices] = extractSlices(original);
    expect(doc).toMatchObject({
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
    });
    expect(slices).toMatchObject({
      M0: {
        text: "\uFFFCHello, world",
        blocks: [
          {
            id: "M0-B0",
            type: "text",
            parents: [],
            selfClosing: false,
            attributes: {},
          },
        ],
        marks: [],
      },
    });
  });

  test("single slice", () => {
    let original = {
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
          type: "slice",
          range: "[0..13]",
          attributes: {},
        },
      ],
    };
    let [doc, slices] = extractSlices(original);
    expect(doc).toMatchObject({
      text: "",
      blocks: [],
      marks: [],
    });
    expect(slices).toMatchObject({
      M0: {
        text: "\uFFFCHello, world",
        blocks: [
          {
            id: "M0-B0",
            type: "text",
            parents: [],
            selfClosing: false,
            attributes: {},
          },
        ],
        marks: [],
      },
    });
  });

  test("slice without a block", () => {
    let original = {
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
          type: "slice",
          range: "[1..13]",
          attributes: {},
        },
      ],
    };
    let [doc, slices] = extractSlices(original);
    expect(doc).toMatchObject({
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
      marks: [],
    });
    expect(slices).toMatchObject({
      M0: {
        text: "\uFFFCHello, world",
        blocks: [
          {
            id: "text-M0",
            type: "text",
            parents: [],
            selfClosing: false,
            attributes: {},
          },
        ],
        marks: [],
      },
    });
  });

  test("mark in slice", () => {
    let original = {
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
          type: "slice",
          range: "[0..13]",
          attributes: {},
        },
        {
          id: "M1",
          type: "bold",
          range: "[1..13]",
          attributes: {},
        },
      ],
    };
    let [doc, slices] = extractSlices(original);
    expect(doc).toMatchObject({
      text: "",
      blocks: [],
      marks: [],
    });
    expect(slices).toMatchObject({
      M0: {
        text: "\uFFFCHello, world",
        blocks: [
          {
            id: "M0-B0",
            type: "text",
            parents: [],
            selfClosing: false,
            attributes: {},
          },
        ],
        marks: [
          {
            id: "M0-M1",
            type: "bold",
            range: "[1..13]",
            attributes: {},
          },
        ],
      },
    });
  });
});
