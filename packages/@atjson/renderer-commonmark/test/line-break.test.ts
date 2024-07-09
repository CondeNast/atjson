import CommonmarkRenderer from "../src";

describe("terminal line breaks are rendered", () => {
  test("in text", () => {
    const document = {
      text: "\ufffctest\ufffc\ufffc",
      blocks: [
        {
          id: "B00000000",
          type: "text",
          parents: [],
          selfClosing: false,
          attributes: {},
        },
        {
          id: "B00000001",
          type: "line-break",
          parents: ["text"],
          selfClosing: true,
          attributes: {},
        },
        {
          id: "B00000002",
          type: "line-break",
          parents: ["text"],
          selfClosing: true,
          attributes: {},
        },
      ],
      marks: [],
    };

    expect(CommonmarkRenderer.render(document)).toBe("test  \n  \n");
  });

  test("in text with interleaving new lines", () => {
    const document = {
      text: "\ufffctest\ufffc\n\ufffc",
      blocks: [
        {
          id: "B00000000",
          type: "text",
          parents: [],
          selfClosing: false,
          attributes: {},
        },
        {
          id: "B00000001",
          type: "line-break",
          parents: ["text"],
          selfClosing: true,
          attributes: {},
        },
        {
          id: "B00000002",
          type: "line-break",
          parents: ["text"],
          selfClosing: true,
          attributes: {},
        },
      ],
      marks: [],
    };

    expect(CommonmarkRenderer.render(document)).toBe("test  \n\n  \n");
  });

  test("in text with preceding linebreaks", () => {
    const document = {
      text: "\ufffctest\ufffctest\ufffc",
      blocks: [
        {
          id: "B00000000",
          type: "text",
          parents: [],
          selfClosing: false,
          attributes: {},
        },
        {
          id: "B00000001",
          type: "line-break",
          parents: ["text"],
          selfClosing: true,
          attributes: {},
        },
        {
          id: "B00000002",
          type: "line-break",
          parents: ["text"],
          selfClosing: true,
          attributes: {},
        },
      ],
      marks: [],
    };

    expect(CommonmarkRenderer.render(document)).toBe("test  \ntest  \n");
  });

  test("in text terminating a mark", () => {
    const document = {
      text: "\ufffctest\ufffc",
      blocks: [
        {
          id: "B00000000",
          type: "text",
          parents: [],
          selfClosing: false,
          attributes: {},
        },
        {
          id: "B00000001",
          type: "line-break",
          parents: ["text"],
          selfClosing: true,
          attributes: {},
        },
      ],
      marks: [
        {
          id: "M00000002",
          type: "bold",
          range: "(1..6]" as const,
          attributes: {},
        },
      ],
    };

    expect(CommonmarkRenderer.render(document)).toBe("**test**  \n");
  });

  test("in paragraphs", () => {
    const document = {
      text: "\ufffctest\ufffc\ufffctest\ufffc",
      blocks: [
        {
          id: "B00000000",
          type: "paragraph",
          parents: [],
          selfClosing: false,
          attributes: {},
        },
        {
          id: "B00000001",
          type: "line-break",
          parents: ["paragraph"],
          selfClosing: true,
          attributes: {},
        },
        {
          id: "B00000002",
          type: "paragraph",
          parents: [],
          selfClosing: false,
          attributes: {},
        },
        {
          id: "B00000003",
          type: "line-break",
          parents: ["paragraph"],
          selfClosing: true,
          attributes: {},
        },
      ],
      marks: [],
    };

    expect(CommonmarkRenderer.render(document)).toBe("test\n\ntest\n\n");
  });
});
