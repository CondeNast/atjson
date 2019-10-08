import Document, { AdjacentBoundaryBehaviour, UnknownAnnotation } from "../src";
import TestSchema, { Bold, Italic } from "./test-source";

describe("Document.insertText", () => {
  test("insert text adds text to the content attribute", () => {
    let doc = new Document({
      content: "Hello",
      annotations: [],
      schema: TestSchema
    });
    doc.insertText(5, " world.");
    expect(doc.content).toBe("Hello world.");
  });

  test("insert text before an annotation moves it forward", () => {
    let doc = new Document({
      content: "abcd",
      annotations: [
        new Bold({
          id: "1",
          start: 1,
          end: 3,
          attributes: {}
        }),
        {
          id: "2",
          type: "-test-link",
          start: 1,
          end: 2,
          attributes: {
            "-test-uri": "https://example.com"
          }
        }
      ],
      schema: TestSchema
    });

    doc.insertText(0, "zzz");
    expect(doc.content).toBe("zzzabcd");

    let [bold, unknown] = doc.annotations;
    expect(bold).toBeInstanceOf(Bold);
    expect(unknown).toBeInstanceOf(UnknownAnnotation);
    expect(doc.annotations.map(a => a.toJSON())).toEqual([
      {
        id: "1",
        type: "-test-bold",
        start: 4,
        end: 6,
        attributes: {}
      },
      {
        id: "2",
        type: "-test-link",
        start: 4,
        end: 5,
        attributes: {
          "-test-uri": "https://example.com"
        }
      }
    ]);
  });

  test("insert text after an annotation doesn't affect it", () => {
    let doc = new Document({
      content: "abcd",
      annotations: [
        new Italic({
          id: "1",
          start: 0,
          end: 2,
          attributes: {}
        }),
        {
          id: "2",
          type: "-test-color",
          start: 0,
          end: 2,
          attributes: {
            "-test-color": "blue"
          }
        }
      ],
      schema: TestSchema
    });
    doc.insertText(3, "zzz");
    expect(doc.content).toBe("abczzzd");

    let [italic, unknown] = doc.annotations;
    expect(italic).toBeInstanceOf(Italic);
    expect(unknown).toBeInstanceOf(UnknownAnnotation);
    expect(doc.annotations.map(a => a.toJSON())).toEqual([
      {
        id: "1",
        type: "-test-italic",
        start: 0,
        end: 2,
        attributes: {}
      },
      {
        id: "2",
        type: "-test-color",
        start: 0,
        end: 2,
        attributes: {
          "-test-color": "blue"
        }
      }
    ]);
  });

  test("insert text inside an annotation adjusts the endpoint", () => {
    let doc = new Document({
      content: "abcd",
      annotations: [
        new Bold({
          id: "1",
          start: 1,
          end: 3,
          attributes: {}
        }),
        {
          id: "2",
          type: "-test-underline",
          start: 1,
          end: 3,
          attributes: {}
        }
      ],
      schema: TestSchema
    });
    doc.insertText(2, "xyz");
    expect(doc.content).toBe("abxyzcd");

    let [bold, unknown] = doc.annotations;
    expect(bold).toBeInstanceOf(Bold);
    expect(unknown).toBeInstanceOf(UnknownAnnotation);
    expect(doc.annotations.map(a => a.toJSON())).toEqual([
      {
        id: "1",
        type: "-test-bold",
        start: 1,
        end: 6,
        attributes: {}
      },
      {
        id: "2",
        type: "-test-underline",
        start: 1,
        end: 6,
        attributes: {}
      }
    ]);
  });

  test("insert text at the left boundary of an annotation", () => {
    let doc = new Document({
      content: "abcd",
      annotations: [
        {
          id: "1",
          type: "-test-italic",
          start: 0,
          end: 2,
          attributes: {}
        },
        {
          id: "2",
          type: "-test-strikethrough",
          start: 0,
          end: 2,
          attributes: {}
        }
      ],
      schema: TestSchema
    });
    doc.insertText(0, "zzz");
    expect(doc.content).toBe("zzzabcd");
    expect(doc.annotations.map(a => a.toJSON())).toEqual([
      {
        id: "1",
        type: "-test-italic",
        start: 3,
        end: 5,
        attributes: {}
      },
      {
        id: "2",
        type: "-test-strikethrough",
        start: 3,
        end: 5,
        attributes: {}
      }
    ]);
  });

  test("insert text at the right boundary of an annotation", () => {
    let doc = new Document({
      content: "abcd",
      annotations: [
        {
          id: "1",
          type: "-test-italic",
          start: 0,
          end: 2,
          attributes: {}
        },
        {
          id: "2",
          type: "-test-underline",
          start: 0,
          end: 2,
          attributes: {}
        }
      ],
      schema: TestSchema
    });
    doc.insertText(2, "zzz");
    expect(doc.content).toBe("abzzzcd");
    expect(doc.annotations.map(a => a.toJSON())).toEqual([
      {
        id: "1",
        type: "-test-italic",
        start: 0,
        end: 5,
        attributes: {}
      },
      {
        id: "2",
        type: "-test-underline",
        start: 0,
        end: 5,
        attributes: {}
      }
    ]);
  });

  test("insert text at the boundary of two adjacent annotations ...", () => {
    let doc = new Document({
      content: "ac",
      annotations: [
        {
          id: "1",
          type: "-test-italic",
          start: 0,
          end: 1,
          attributes: {}
        },
        {
          id: "2",
          type: "-test-bold",
          start: 1,
          end: 2,
          attributes: {}
        },
        {
          id: "3",
          type: "-test-superscript",
          start: 0,
          end: 1,
          attributes: {}
        },
        {
          id: "4",
          type: "-test-subscript",
          start: 1,
          end: 2,
          attributes: {}
        }
      ],
      schema: TestSchema
    });

    doc.insertText(1, "b");

    expect(doc.content).toBe("abc");
    expect(doc.annotations.map(a => a.toJSON())).toEqual([
      {
        id: "1",
        type: "-test-italic",
        start: 0,
        end: 2,
        attributes: {}
      },
      {
        id: "2",
        type: "-test-bold",
        start: 2,
        end: 3,
        attributes: {}
      },
      {
        id: "3",
        type: "-test-superscript",
        start: 0,
        end: 2,
        attributes: {}
      },
      {
        id: "4",
        type: "-test-subscript",
        start: 2,
        end: 3,
        attributes: {}
      }
    ]);
  });

  test("insert text at the left boundary of an annotation preserving boundaries", () => {
    let doc = new Document({
      content: "abcd",
      annotations: [
        {
          id: "1",
          type: "-test-bold",
          start: 0,
          end: 2,
          attributes: {}
        }
      ],
      schema: TestSchema
    });
    doc.insertText(0, "zzz", AdjacentBoundaryBehaviour.preserve);
    expect(doc.content).toBe("zzzabcd");
    expect(doc.annotations.map(a => a.toJSON())).toEqual([
      {
        id: "1",
        type: "-test-bold",
        start: 0,
        end: 5,
        attributes: {}
      }
    ]);
  });

  test("insert text at the right boundary of an annotation preserving boundaries", () => {
    let doc = new Document({
      content: "abcd",
      annotations: [
        {
          id: "1",
          type: "-test-italic",
          start: 0,
          end: 2,
          attributes: {}
        },
        {
          id: "2",
          type: "-test-underline",
          start: 0,
          end: 2,
          attributes: {}
        }
      ],
      schema: TestSchema
    });

    doc.insertText(2, "zzz", AdjacentBoundaryBehaviour.preserve);
    expect(doc.content).toBe("abzzzcd");
    expect(doc.annotations.map(a => a.toJSON())).toEqual([
      {
        id: "1",
        type: "-test-italic",
        start: 0,
        end: 2,
        attributes: {}
      },
      {
        id: "2",
        type: "-test-underline",
        start: 0,
        end: 2,
        attributes: {}
      }
    ]);
  });

  test("insert text at the boundary of two adjacent annotations preserving boundaries", () => {
    let doc = new Document({
      content: "ac",
      annotations: [
        {
          id: "1",
          type: "-test-bold",
          start: 0,
          end: 1,
          attributes: {}
        },
        {
          id: "2",
          type: "-test-italic",
          start: 1,
          end: 2,
          attributes: {}
        }
      ],
      schema: TestSchema
    });

    doc.insertText(1, "b", AdjacentBoundaryBehaviour.preserve);

    expect(doc.content).toBe("abc");
    expect(doc.annotations.map(a => a.toJSON())).toEqual([
      {
        id: "1",
        type: "-test-bold",
        start: 0,
        end: 1,
        attributes: {}
      },
      {
        id: "2",
        type: "-test-italic",
        start: 1,
        end: 3,
        attributes: {}
      }
    ]);
  });

  test("insert text at the boundary with a custom transform", () => {
    let doc = new Document({
      content: "abcd",
      annotations: [
        {
          id: "1",
          type: "-test-manual",
          start: 0,
          end: 2,
          attributes: {}
        },
        {
          id: "2",
          type: "-test-emoji",
          start: 0,
          end: 2,
          attributes: {
            "-test-emoji": "❤️"
          }
        }
      ],
      schema: TestSchema
    });

    doc.insertText(2, "zzz");
    expect(doc.content).toBe("abzzzcd");
    expect(doc.annotations.map(a => a.toJSON())).toEqual([
      {
        id: "1",
        type: "-test-manual",
        start: 1,
        end: 3,
        attributes: {}
      },
      {
        id: "2",
        type: "-test-emoji",
        start: 0,
        end: 5,
        attributes: {
          "-test-emoji": "❤️"
        }
      }
    ]);
  });
});
