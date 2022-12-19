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

  test("mark crossing slice boundary", () => {
    let original = {
      text: "\uFFFCHello, world\uFFFCThis is a paragraph",
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
          range: "[1..33]",
          attributes: {},
        },
      ],
    };
    let [doc, slices] = extractSlices(original);
    expect(doc).toMatchObject({
      text: "\uFFFCThis is a paragraph",
      blocks: [
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
          range: "[0..20]",
          attributes: {},
        },
      ],
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

  test("multiple blocks in slice", () => {
    const original = {
      text: "￼￼Maude by Anna Margaret Hollyman from anna margaret hollyman on Vimeo.￼Teeny thought it was just another routine babysitting job—until she's shocked to meet the client. As the day goes on, Teeny decides to become the woman she had no idea she always wanted to be ... until she gets caught.\"Maude\" is this week's Staff Pick Premiere! Read more about it here: https://vimeo.com/blog/post/staff-pick-premiere-maude-by-anna-margaret-hollyman/",
      blocks: [
        {
          id: "B00000000",
          type: "video-embed",
          parents: [],
          selfClosing: false,
          attributes: {
            provider: "VIMEO",
            url: "https://player.vimeo.com/video/366624013",
            width: 640,
            height: 360,
            caption: "M00000000",
          },
        },
        {
          id: "B00000001",
          type: "paragraph",
          parents: ["video-embed"],
          selfClosing: false,
          attributes: {},
        },
        {
          id: "B00000002",
          type: "paragraph",
          parents: ["video-embed"],
          selfClosing: false,
          attributes: {},
        },
      ],
      marks: [
        {
          id: "M00000000",
          type: "slice",
          range: "(1..439]",
          attributes: {
            refs: ["B00000000"],
          },
        },
        {
          id: "M00000001",
          type: "link",
          range: "(2..33)",
          attributes: {
            url: "https://vimeo.com/366624013",
          },
        },
        {
          id: "M00000002",
          type: "link",
          range: "(39..61)",
          attributes: {
            url: "https://vimeo.com/annamargarethollyman",
          },
        },
        {
          id: "M00000003",
          type: "link",
          range: "(65..70)",
          attributes: {
            url: "https://vimeo.com",
          },
        },
      ],
    };
    let [, slices] = extractSlices(original);
    expect(slices.M00000000.blocks.length).toBe(2);
    expect(slices.M00000000.blocks[0].parents).toStrictEqual([]);
    expect(slices.M00000000.blocks[1].parents).toStrictEqual([]);
  });
});
