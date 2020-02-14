import Document, { BlockAnnotation, ParseAnnotation } from "../src/index";

export class Paragraph extends BlockAnnotation {
  static vendorPrefix = "text";
  static type = "paragraph";
}

const TextSchema = {
  annotations: { Paragraph }
} as const;

export default TextSchema;

export function fromRaw(text: string) {
  let annotations = [];
  let start = 0;
  let id = 1;
  while (text.indexOf("\n", start) !== -1) {
    let end = text.indexOf("\n", start);
    annotations.push(
      {
        id: (id++).toString(),
        type: "-text-paragraph",
        start,
        end: end + 1,
        attributes: {}
      },
      {
        id: (id++).toString(),
        type: "-atjson-parse-token",
        start: end,
        end: end + 1,
        attributes: {}
      }
    );
    start = end + 1;
  }
  if (start < text.length) {
    annotations.push({
      id: (id++).toString(),
      type: "-text-paragraph",
      start,
      end: text.length,
      attributes: {}
    });
  }

  return new Document({
    content: text,
    annotations,
    schema: TextSchema
  });
}

describe("TextSource", () => {
  test("a simple document", () => {
    let source = fromRaw("Hello\nWorld");
    expect(source.toJSON()).toEqual({
      content: "Hello\nWorld",
      annotations: [
        {
          id: "1",
          type: "-text-paragraph",
          start: 0,
          end: 6,
          attributes: {}
        },
        {
          id: "2",
          type: "-atjson-parse-token",
          start: 5,
          end: 6,
          attributes: {}
        },
        {
          id: "3",
          type: "-text-paragraph",
          start: 6,
          end: 11,
          attributes: {}
        }
      ],
      schema: ["-text-paragraph"]
    });
  });

  test("annotations are reified as Annotation instances", () => {
    let source = fromRaw("Hello\nWorld");
    let [firstParagraph, parseToken, lastParagraph] = source.annotations;

    expect(firstParagraph).toBeInstanceOf(Paragraph);
    expect(parseToken).toBeInstanceOf(ParseAnnotation);
    expect(lastParagraph).toBeInstanceOf(Paragraph);
  });
});
