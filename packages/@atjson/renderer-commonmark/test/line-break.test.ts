import CommonmarkRenderer from "../src";

describe("terminal line breaks are removed", () => {
  test("in text", () => {
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
          id: "B00000000",
          type: "line-break",
          parents: ["text"],
          selfClosing: true,
          attributes: {},
        },
      ],
      marks: [],
    };

    expect(CommonmarkRenderer.render(document)).toBe("test");
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
          id: "B00000000",
          type: "line-break",
          parents: ["text"],
          selfClosing: true,
          attributes: {},
        },
        {
          id: "B00000000",
          type: "line-break",
          parents: ["text"],
          selfClosing: true,
          attributes: {},
        },
      ],
      marks: [],
    };

    expect(CommonmarkRenderer.render(document)).toBe("test\\\ntest");
  });

  test.skip("in text terminating a mark", () => {
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
          id: "B00000000",
          type: "line-break",
          parents: ["text"],
          selfClosing: true,
          attributes: {},
        },
      ],
      marks: [
        {
          id: "M00000000",
          type: "bold",
          range: "(1..6]" as const,
          attributes: {},
        },
      ],
    };

    expect(CommonmarkRenderer.render(document)).toBe("**test**");
  });

  test("in paragraph", () => {
    const document = {
      text: "\ufffctest\ufffc",
      blocks: [
        {
          id: "B00000000",
          type: "paragraph",
          parents: [],
          selfClosing: false,
          attributes: {},
        },
        {
          id: "B00000000",
          type: "line-break",
          parents: ["paragraph"],
          selfClosing: true,
          attributes: {},
        },
      ],
      marks: [],
    };

    expect(CommonmarkRenderer.render(document)).toBe("test\n\n");
  });
});

describe("are slash escaped", () => {
  test("in text", () => {
    const document = {
      text: "\ufffcline 1\ufffcline 2",
      blocks: [
        {
          id: "B00000000",
          type: "text",
          parents: [],
          selfClosing: false,
          attributes: {},
        },
        {
          id: "B00000000",
          type: "line-break",
          parents: ["text"],
          selfClosing: true,
          attributes: {},
        },
      ],
      marks: [],
    };

    expect(CommonmarkRenderer.render(document)).toBe("line 1\\\nline 2");
  });

  test("in text terminating a mark", () => {
    const document = {
      text: "\ufffcline 1\ufffcline 2",
      blocks: [
        {
          id: "B00000000",
          type: "text",
          parents: [],
          selfClosing: false,
          attributes: {},
        },
        {
          id: "B00000000",
          type: "line-break",
          parents: ["text"],
          selfClosing: true,
          attributes: {},
        },
      ],
      marks: [
        {
          id: "M00000000",
          type: "bold",
          range: "(1..8]" as const,
          attributes: {},
        },
      ],
    };

    expect(CommonmarkRenderer.render(document)).toBe("**line 1**\\\nline 2");
  });

  test("in paragraph", () => {
    const document = {
      text: "\ufffcline 1\ufffcline 2",
      blocks: [
        {
          id: "B00000000",
          type: "paragraph",
          parents: [],
          selfClosing: false,
          attributes: {},
        },
        {
          id: "B00000000",
          type: "line-break",
          parents: ["paragraph"],
          selfClosing: true,
          attributes: {},
        },
      ],
      marks: [],
    };

    expect(CommonmarkRenderer.render(document)).toBe("line 1\\\nline 2\n\n");
  });
});
