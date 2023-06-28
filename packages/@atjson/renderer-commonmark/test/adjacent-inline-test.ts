import OffsetSource from "@atjson/offset-annotations";
import CommonmarkRenderer from "../src";
import { deserialize } from "@atjson/document";

describe("adjacent inline annotations", () => {
  test("adjacent bold italic", () => {
    let document = deserialize(
      {
        text: "\uFFFCbolditalic",
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
          { id: "M00000000", type: "bold", range: "(1..5]", attributes: {} },
          {
            id: "M00000001",
            type: "italic",
            range: "(5..11]",
            attributes: {},
          },
        ],
      },
      OffsetSource
    );

    expect(CommonmarkRenderer.render(document)).toBe("**bold**_italic_");
  });

  test("continued bold", () => {
    let document = deserialize(
      {
        text: "\uFFFCboldbold",
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
          { id: "M00000000", type: "bold", range: "(1..5]", attributes: {} },
          { id: "M00000001", type: "bold", range: "(5..9]", attributes: {} },
        ],
      },
      OffsetSource
    );

    expect(CommonmarkRenderer.render(document)).toBe("**bold**__bold__");
  });

  test("continued bold with leading space", () => {
    let document = deserialize(
      {
        text: "\uFFFCbold bold",
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
          { id: "M00000000", type: "bold", range: "(1..5]", attributes: {} },
          { id: "M00000001", type: "bold", range: "(5..10]", attributes: {} },
        ],
      },
      OffsetSource
    );

    expect(CommonmarkRenderer.render(document)).toBe("**bold** **bold**");
  });

  test("continued bold with trailing space", () => {
    let document = deserialize(
      {
        text: "\uFFFCbold bold",
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
          { id: "M00000000", type: "bold", range: "(1..6]", attributes: {} },
          { id: "M00000001", type: "bold", range: "(6..10]", attributes: {} },
        ],
      },
      OffsetSource
    );

    expect(CommonmarkRenderer.render(document)).toBe("**bold** **bold**");
  });

  test("continued bold and italic", () => {
    let document = deserialize(
      {
        text: "￼Bold bold and italic",
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
          { id: "M00000000", type: "bold", range: "(1..6]", attributes: {} },
          { id: "M00000001", type: "bold", range: "(6..21]", attributes: {} },
          {
            id: "M00000002",
            type: "italic",
            range: "(6..21]",
            attributes: {},
          },
        ],
      },
      OffsetSource
    );

    expect(CommonmarkRenderer.render(document)).toBe(
      "**Bold** ***bold and italic***"
    );
  });

  test("continued bold and italic with parse annotations", () => {
    let document = deserialize(
      {
        text: "￼Bold bold and italic",
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
          { id: "M00000000", type: "bold", range: "(1..5]", attributes: {} },
          { id: "M00000001", type: "bold", range: "(5..21]", attributes: {} },
          {
            id: "M00000002",
            type: "italic",
            range: "(5..21]",
            attributes: {},
          },
        ],
      },
      OffsetSource
    );

    expect(CommonmarkRenderer.render(document)).toBe(
      "**Bold** ***bold and italic***"
    );
  });
});
