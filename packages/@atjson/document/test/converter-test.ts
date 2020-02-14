import Document, { Annotation } from "../src";
import TestSchema, { Bold, Paragraph } from "./test-schema";
import TextSchema, { fromRaw } from "./text-schema-test";
import { Converter } from "../src/converter";

describe("Converter", () => {
  test("sources with conversions are called", () => {
    let testDoc = new Document({
      content: "Hello, World!",
      annotations: [
        new Paragraph({ start: 0, end: 13 }),
        new Bold({ start: 0, end: 5 })
      ],
      schema: TestSchema
    });

    let converter = new Converter(TestSchema, TextSchema, doc => {
      let { schema: expectedSchema, ...expectedJson } = doc.toJSON();
      let { schema: actualSchema, ...actualJson } = testDoc.toJSON();
      expect(expectedJson).toMatchObject(actualJson);
      expect(expectedSchema).toEqual(expect.arrayContaining(actualSchema));
      doc.where(a => a.type !== "paragraph").remove();
      doc.where({ type: "-test-paragraph" }).set({ type: "-text-paragraph" });

      return doc;
    });

    let textDoc = converter.convert(testDoc);
    expect(textDoc.all().toJSON()).toEqual([
      {
        id: "Any<id>",
        type: "-text-paragraph",
        start: 0,
        end: 13,
        attributes: {}
      }
    ]);
  });

  test("conversion doesn't modify the original document", () => {
    let converter = new Converter(TestSchema, TextSchema, doc => {
      doc.annotations.forEach((a: Annotation) => {
        a.start = 0;
        a.end = 0;
      });

      return doc;
    });

    let testDoc = new Document({
      content: "Hello, World!",
      annotations: [
        new Paragraph({ start: 0, end: 13 }),
        new Bold({ start: 0, end: 5 })
      ],
      schema: TestSchema
    });

    converter.convert(testDoc);

    expect(testDoc).toMatchObject({
      content: "Hello, World!",
      annotations: [
        { start: 0, end: 13 },
        { start: 0, end: 5 }
      ]
    });
  });

  test("slice of conversion document is in the original source", () => {
    let testDoc = new Document({
      content: "Hello, World!",
      annotations: [],
      schema: TestSchema
    });

    let converter = new Converter(TestSchema, TextSchema, doc => {
      let slice = doc.slice(0, 1);
      expect(slice.schema).toEqual(TestSchema);

      return doc;
    });

    converter.convert(testDoc);
  });
});
