import Document, { ParseAnnotation, UnknownAnnotation } from "../src";
import TestSchema, { Bold, Paragraph } from "./test-source";

describe("Document", () => {
  describe("new", () => {
    test("with no annotations", () => {
      expect(
        new Document({
          content: "Hello World.",
          annotations: [],
          schema: TestSchema
        })
      ).toBeDefined();
    });

    test("with instantiated annotations", () => {
      let doc = new Document({
        content: "Hello World.",
        annotations: [
          new Bold({
            start: 0,
            end: 2,
            attributes: {}
          })
        ],
        schema: TestSchema
      });

      expect(doc).toBeDefined();
      expect(doc.where(a => a instanceof Bold).length).toBe(1);
    });

    test("with UnknownAnnotations", () => {
      let doc = new Document({
        content: "Hello World.",
        annotations: [
          new UnknownAnnotation({
            start: 0,
            end: 2,
            attributes: {
              type: "-test-bold",
              attributes: {}
            }
          })
        ],
        schema: TestSchema
      });

      expect(doc.where(a => a instanceof Bold).length).toBe(1);
    });

    test("with annotation JSON", () => {
      let doc = new Document({
        content: "Hello World.",
        annotations: [
          {
            type: "-test-bold",
            start: 0,
            end: 2,
            attributes: {}
          }
        ],
        schema: TestSchema
      });

      expect(doc.where(a => a instanceof Bold).length).toBe(1);
    });
  });

  describe("canonical", () => {
    test("parse tokens are properly removed", () => {
      let testDoc = new Document({
        content: "<b>Hello</b>,\n World!",
        annotations: [
          new ParseAnnotation({ start: 0, end: 3 }),
          new ParseAnnotation({ start: 8, end: 12 }),
          new Paragraph({ start: 0, end: 13 }),
          new Bold({ start: 0, end: 12 })
        ],
        schema: TestSchema
      });

      expect(testDoc.canonical()).toMatchObject({
        content: "Hello,\n World!",
        annotations: [
          new Bold({
            start: 0,
            end: 5
          }),
          new Paragraph({
            start: 0,
            end: 6
          })
        ]
      });
    });
  });

  test("clone", () => {
    let document = new Document({
      content: "Hello World.",
      annotations: [
        new Bold({
          start: 0,
          end: 2,
          attributes: {}
        })
      ],
      schema: TestSchema
    });
    let clone = document.clone();
    let [bold] = document.annotations;
    let [cloneBold] = clone.annotations;

    expect(clone.schema).toEqual(TestSchema);
    expect(document.content).toEqual(clone.content);
    expect(bold).not.toBe(cloneBold);
    expect(bold).toBeInstanceOf(Bold);
    expect(cloneBold).toBeInstanceOf(Bold);
    expect(document.toJSON()).toEqual(clone.toJSON());
  });

  describe("equals", () => {
    test("documents are correctly compared for equality", () => {
      let leftHandSideTestDoc = new Document({
        content: "<b>Hello</b>,\n World!",
        annotations: [
          new ParseAnnotation({ start: 0, end: 3 }),
          new ParseAnnotation({ start: 8, end: 12 }),
          new Paragraph({ start: 0, end: 13 }),
          new Bold({ start: 0, end: 12 })
        ],
        schema: TestSchema
      });

      let rightHandSideTestDoc = new Document({
        content: "<b>Hello</b>,\n <blink>World!</blink>",
        annotations: [
          new ParseAnnotation({ start: 15, end: 22 }),
          new ParseAnnotation({ start: 28, end: 36 }),
          new ParseAnnotation({ start: 0, end: 3 }),
          new ParseAnnotation({ start: 8, end: 12 }),
          new Paragraph({ start: 0, end: 13 }),
          new Bold({ start: 0, end: 12 })
        ],
        schema: TestSchema
      });

      let unequalRightHandSideTestDoc = new TestSource({
        content: "<b>Hello</b>,\n <blink>World!</blink>",
        annotations: [
          new ParseAnnotation({ start: 15, end: 22 }),
          new ParseAnnotation({ start: 28, end: 36 }),
          new ParseAnnotation({ start: 0, end: 3 }),
          new ParseAnnotation({ start: 8, end: 12 }),
          new Paragraph({ start: 0, end: 13 })
        ]
      });

      expect(leftHandSideTestDoc.equals(rightHandSideTestDoc)).toBe(true);
      expect(leftHandSideTestDoc.equals(unequalRightHandSideTestDoc)).toBe(
        false
      );
    });

    test("annotation attributes are correctly compared for equality", () => {
      let leftHandSideTestDoc = new TestSource({
        content: "\uFFFC",
        annotations: [
          {
            id: "1",
            type: "-test-image",
            start: 0,
            end: 1,
            attributes: {
              "-test-url": "http://www.example.com/test.jpg",
              "-test-caption": {
                content: "An example caption",
                annotations: [
                  {
                    type: "-test-italic",
                    start: 3,
                    end: 10,
                    attributes: {}
                  }
                ]
              }
            }
          }
        ]
      });

      let rightHandSideTestDoc = new TestSource({
        content: "\uFFFC",
        annotations: [
          {
            id: "1",
            type: "-test-image",
            start: 0,
            end: 1,
            attributes: {
              "-test-url": "http://www.example.com/test.jpg",
              "-test-caption": {
                content: "An example caption",
                annotations: [
                  {
                    type: "-test-italic",
                    start: 3,
                    end: 10,
                    attributes: {}
                  }
                ]
              }
            }
          }
        ]
      });

      let unequalRightHandSideTestDoc = new TestSource({
        content: "\uFFFC",
        annotations: [
          {
            id: "1",
            type: "-test-image",
            start: 0,
            end: 1,
            attributes: {
              "-test-url": "http://www.example.com/test.jpg",
              "-test-caption": {
                content: "An example caption",
                annotations: [
                  {
                    type: "-test-italic",
                    start: 4,
                    end: 10,
                    attributes: {}
                  }
                ]
              }
            }
          }
        ]
      });

      expect(leftHandSideTestDoc.equals(rightHandSideTestDoc)).toBe(true);
      expect(leftHandSideTestDoc.equals(unequalRightHandSideTestDoc)).toBe(
        false
      );
    });

    test("HTML documents and MD documents are correctly compared for equality", () => {
      let MDTestDoc = new TestSource({
        content: "Hello, **world**",
        annotations: [
          new ParseAnnotation({ start: 14, end: 16 }),
          new ParseAnnotation({ start: 7, end: 9 }),
          new Bold({ start: 7, end: 16 })
        ]
      });

      let HTMLTestDoc = new TestSource({
        content: "Hello, <b>world</b>",
        annotations: [
          new ParseAnnotation({ start: 7, end: 10 }),
          new ParseAnnotation({ start: 15, end: 19 }),
          new Bold({ start: 7, end: 19 })
        ]
      });
      expect(MDTestDoc.equals(HTMLTestDoc)).toBe(true);
    });
  });
});
