import Renderer from "../src";

describe("encoding entities", () => {
  test("Japanese", () => {
    let doc = {
      text: "\uFFFC同性の両親",
      blocks: [
        {
          attributes: {},
          id: "B00000000",
          parents: [],
          selfClosing: false,
          type: "paragraph",
        },
      ],
      marks: [],
    };

    expect(Renderer.render(doc)).toEqual("<p>同性の両親</p>");
  });
  test("HTML reserved entities", () => {
    let doc = {
      text: "\uFFFC<>&",
      blocks: [
        {
          attributes: {},
          id: "B00000000",
          parents: [],
          selfClosing: false,
          type: "paragraph",
        },
      ],
      marks: [],
    };

    expect(Renderer.render(doc)).toEqual("<p>&lt;&gt;&amp;</p>");
  });
});
