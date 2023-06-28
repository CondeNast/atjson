import OffsetSource from "@atjson/offset-annotations";
import CommonmarkRenderer from "../src";

describe("adjacent inline annotations", () => {
  test("adjacent bold italic", () => {
    let document = new OffsetSource({
      content: "bolditalic",
      annotations: [
        {
          id: "1",
          type: "-offset-bold",
          start: 0,
          end: 4,
          attributes: {},
        },
        {
          id: "2",
          type: "-offset-italic",
          start: 4,
          end: 10,
          attributes: {},
        },
      ],
    });

    expect(CommonmarkRenderer.render(document)).toBe("**bold**_italic_");
  });

  test("continued bold", () => {
    let document = new OffsetSource({
      content: "boldbold",
      annotations: [
        {
          id: "1",
          type: "-offset-bold",
          start: 0,
          end: 4,
          attributes: {},
        },
        {
          id: "2",
          type: "-offset-bold",
          start: 4,
          end: 8,
          attributes: {},
        },
      ],
    });

    expect(CommonmarkRenderer.render(document)).toBe("**bold**__bold__");
  });

  test("continued bold with leading space", () => {
    let document = new OffsetSource({
      content: "bold bold",
      annotations: [
        {
          id: "1",
          type: "-offset-bold",
          start: 0,
          end: 4,
          attributes: {},
        },
        {
          id: "2",
          type: "-offset-bold",
          start: 4,
          end: 9,
          attributes: {},
        },
      ],
    });

    expect(CommonmarkRenderer.render(document)).toBe("**bold** **bold**");
  });

  test("continued bold with parse annotations in between", () => {
    let document = new OffsetSource({
      content: "<b>bold</b><b>bold</b>",
      annotations: [
        {
          id: "1",
          type: "-offset-bold",
          start: 0,
          end: 11,
          attributes: {},
        },
        {
          id: "2",
          type: "-atjson-parse-token",
          start: 0,
          end: 3,
          attributes: {},
        },
        {
          id: "3",
          type: "-atjson-parse-token",
          start: 7,
          end: 11,
          attributes: {},
        },
        {
          id: "4",
          type: "-offset-bold",
          start: 11,
          end: 22,
          attributes: {},
        },
        {
          id: "5",
          type: "-atjson-parse-token",
          start: 11,
          end: 14,
          attributes: {},
        },
        {
          id: "6",
          type: "-atjson-parse-token",
          start: 18,
          end: 22,
          attributes: {},
        },
      ],
    });

    expect(CommonmarkRenderer.render(document)).toBe("**bold**__bold__");
  });

  test("continued bold and italic", () => {
    let document = new OffsetSource({
      content: "Bold bold and italic",
      annotations: [
        {
          id: "1",
          type: "-offset-bold",
          start: 0,
          end: 5,
          attributes: {},
        },
        {
          id: "2",
          type: "-offset-bold",
          start: 5,
          end: 20,
          attributes: {},
        },
        {
          id: "3",
          type: "-offset-italic",
          start: 5,
          end: 20,
          attributes: {},
        },
      ],
    });

    expect(CommonmarkRenderer.render(document)).toBe(
      "**Bold** ***bold and italic***"
    );
  });

  test("continued bold and italic with parse annotations", () => {
    let document = new OffsetSource({
      content: "<b>Bold</b><i><b> bold and italic</b></i>",
      annotations: [
        {
          id: "1",
          type: "-offset-bold",
          start: 0,
          end: 11,
          attributes: {},
        },
        {
          id: "2",
          type: "-atjson-parse-token",
          start: 0,
          end: 3,
          attributes: {},
        },
        {
          id: "3",
          type: "-atjson-parse-token",
          start: 7,
          end: 11,
          attributes: {},
        },
        {
          id: "4",
          type: "-offset-italic",
          start: 11,
          end: 41,
          attributes: {},
        },
        {
          id: "5",
          type: "-atjson-parse-token",
          start: 11,
          end: 14,
          attributes: {},
        },
        {
          id: "6",
          type: "-atjson-parse-token",
          start: 37,
          end: 41,
          attributes: {},
        },
        {
          id: "7",
          type: "-offset-bold",
          start: 14,
          end: 37,
          attributes: {},
        },
        {
          id: "8",
          type: "-atjson-parse-token",
          start: 14,
          end: 17,
          attributes: {},
        },
        {
          id: "9",
          type: "-atjson-parse-token",
          start: 33,
          end: 37,
          attributes: {},
        },
      ],
    });

    expect(CommonmarkRenderer.render(document)).toBe(
      "**Bold** ***bold and italic***"
    );
  });
});
