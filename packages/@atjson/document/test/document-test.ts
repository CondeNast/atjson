import { mergeRanges } from "../src";
import TestSource, { Bold, Paragraph } from "./test-source";
import { ParseAnnotation } from "../src";

describe("Document#deleteTextRanges", () => {
  describe("mergeRanges", () => {
    test("merges overlapping ranges", () => {
      expect(
        mergeRanges([
          { start: 0, end: 5 },
          { start: 5, end: 12 },
          { start: 4, end: 8 }
        ])
      ).toEqual([{ start: 0, end: 12 }]);
    });

    test("sorts ranges", () => {
      expect(
        mergeRanges([
          { start: 8, end: 10 },
          { start: 0, end: 4 }
        ])
      ).toEqual([
        { start: 0, end: 4 },
        { start: 8, end: 10 }
      ]);
    });

    test("handles more complex cases", () => {
      expect(
        mergeRanges([
          { start: 16, end: 17 },
          { start: 4, end: 5 },
          { start: 5, end: 10 },
          { start: 30, end: 33 },
          { start: 13, end: 13 },
          { start: 8, end: 10 },
          { start: 13, end: 14 },
          { start: 30, end: 33 }
        ])
      ).toEqual([
        { start: 4, end: 10 },
        { start: 13, end: 14 },
        { start: 16, end: 17 },
        { start: 30, end: 33 }
      ]);
    });

    test("doesn't mutate its argument", () => {
      // overlapping and out of order
      let ranges = [
        { start: 4, end: 6 },
        { start: 0, end: 5 },
        { start: 3, end: 4 }
      ];

      mergeRanges(ranges);

      expect(ranges).toMatchObject([
        { start: 4, end: 6 },
        { start: 0, end: 5 },
        { start: 3, end: 4 }
      ]);
    });
  });

  test("adjusts annotations properly", () => {
    let testDoc = new TestSource({
      content: "<b>Hello</b>,\n World!",
      annotations: [
        new ParseAnnotation({ start: 0, end: 3 }),
        new ParseAnnotation({ start: 8, end: 12 }),
        new Paragraph({ start: 0, end: 13 }),
        new Bold({ start: 0, end: 12 })
      ]
    });

    testDoc.deleteTextRanges([
      { start: 0, end: 3 },
      { start: 8, end: 12 }
    ]);

    expect(testDoc).toMatchObject({
      content: "Hello,\n World!",
      annotations: [
        { start: 0, end: 0 },
        { start: 5, end: 5 },
        { start: 0, end: 6 },
        { start: 0, end: 5 }
      ]
    });
  });

  test("doesn't mutate its argument", () => {
    let testDoc = new TestSource({
      content: "<b>Hello</b>,\n World!",
      annotations: [
        new ParseAnnotation({ start: 8, end: 12 }),
        new ParseAnnotation({ start: 0, end: 3 }),
        new Paragraph({ start: 0, end: 13 }),
        new Bold({ start: 0, end: 12 })
      ]
    });

    let rangesToDelete = [
      { start: 8, end: 12 },
      { start: 0, end: 3 }
    ];

    testDoc.deleteTextRanges(rangesToDelete);

    expect(rangesToDelete).toMatchObject([
      { start: 8, end: 12 },
      { start: 0, end: 3 }
    ]);
  });
});

describe("Document#removeAnnotations", () => {
  test("removes annotations", () => {
    let parseAnnotations = [
      new ParseAnnotation({ start: 3, end: 4 }),
      new ParseAnnotation({ start: 17, end: 18 }),
      new ParseAnnotation({ start: 11, end: 12 }),
      new ParseAnnotation({ start: 15, end: 16 }),
      new ParseAnnotation({ start: 7, end: 8 }),
      new ParseAnnotation({ start: 1, end: 2 }),
      new ParseAnnotation({ start: 21, end: 22 }),
      new ParseAnnotation({ start: 23, end: 24 }),
      new ParseAnnotation({ start: 19, end: 20 }),
      new ParseAnnotation({ start: 13, end: 14 }),
      new ParseAnnotation({ start: 5, end: 6 }),
      new ParseAnnotation({ start: 9, end: 10 })
    ];
    let testDoc = new TestSource({
      content: "a b c d e f g h i j k l m n o p q r s t u v w x y z",
      annotations: [
        ...parseAnnotations,
        new Paragraph({ start: 0, end: 13 }),
        new Bold({ start: 0, end: 12 })
      ]
    });

    testDoc.removeAnnotations(parseAnnotations);

    expect(testDoc).toMatchObject({
      annotations: [
        { type: "bold", start: 0, end: 12 },
        { type: "paragraph", start: 0, end: 13 }
      ]
    });
  });

  test("doesn't mutate its argument", () => {
    let parseAnnotations = [
      new ParseAnnotation({ start: 3, end: 4 }),
      new ParseAnnotation({ start: 17, end: 18 }),
      new ParseAnnotation({ start: 11, end: 12 }),
      new ParseAnnotation({ start: 15, end: 16 }),
      new ParseAnnotation({ start: 7, end: 8 }),
      new ParseAnnotation({ start: 1, end: 2 }),
      new ParseAnnotation({ start: 21, end: 22 }),
      new ParseAnnotation({ start: 23, end: 24 }),
      new ParseAnnotation({ start: 19, end: 20 }),
      new ParseAnnotation({ start: 13, end: 14 }),
      new ParseAnnotation({ start: 5, end: 6 }),
      new ParseAnnotation({ start: 9, end: 10 })
    ];
    let testDoc = new TestSource({
      content: "a b c d e f g h i j k l m n o p q r s t u v w x y z",
      annotations: [
        ...parseAnnotations,
        new Paragraph({ start: 0, end: 13 }),
        new Bold({ start: 0, end: 12 })
      ]
    });

    testDoc.removeAnnotations(parseAnnotations);

    expect(parseAnnotations).toMatchObject([
      { start: 3, end: 4 },
      { start: 17, end: 18 },
      { start: 11, end: 12 },
      { start: 15, end: 16 },
      { start: 7, end: 8 },
      { start: 1, end: 2 },
      { start: 21, end: 22 },
      { start: 23, end: 24 },
      { start: 19, end: 20 },
      { start: 13, end: 14 },
      { start: 5, end: 6 },
      { start: 9, end: 10 }
    ]);
  });
});

describe("Document#canonical", () => {
  test("parse tokens are properly removed", () => {
    let testDoc = new TestSource({
      content: "<b>Hello</b>,\n World!",
      annotations: [
        new ParseAnnotation({ start: 0, end: 3 }),
        new ParseAnnotation({ start: 8, end: 12 }),
        new Paragraph({ start: 0, end: 13 }),
        new Bold({ start: 0, end: 12 })
      ]
    });

    expect(testDoc.canonical()).toMatchObject({
      contentType: "application/vnd.atjson+test",
      content: "Hello,\n World!",
      annotations: [
        {
          type: "bold",
          start: 0,
          end: 5,
          attributes: {}
        },
        {
          type: "paragraph",
          start: 0,
          end: 6,
          attributes: {}
        }
      ]
    });
  });
});

describe("Document#equals", () => {
  test("documents are correctly compared for equality", () => {
    let leftHandSideTestDoc = new TestSource({
      content: "<b>Hello</b>,\n World!",
      annotations: [
        new ParseAnnotation({ start: 0, end: 3 }),
        new ParseAnnotation({ start: 8, end: 12 }),
        new Paragraph({ start: 0, end: 13 }),
        new Bold({ start: 0, end: 12 })
      ]
    });

    let rightHandSideTestDoc = new TestSource({
      content: "<b>Hello</b>,\n <blink>World!</blink>",
      annotations: [
        new ParseAnnotation({ start: 15, end: 22 }),
        new ParseAnnotation({ start: 28, end: 36 }),
        new ParseAnnotation({ start: 0, end: 3 }),
        new ParseAnnotation({ start: 8, end: 12 }),
        new Paragraph({ start: 0, end: 13 }),
        new Bold({ start: 0, end: 12 })
      ]
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
    expect(leftHandSideTestDoc.equals(unequalRightHandSideTestDoc)).toBe(false);
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
    expect(leftHandSideTestDoc.equals(unequalRightHandSideTestDoc)).toBe(false);
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
