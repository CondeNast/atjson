import OffsetSource, {
  Blockquote,
  Bold,
  Code,
  Heading,
  HorizontalRule,
  Image,
  ImageDescriptionSource,
  Italic,
  LineBreak,
  Link,
  List,
  ListItem,
  Paragraph,
  Subscript,
  Superscript,
  Underline
} from "@atjson/offset-annotations";
import Renderer from "../src";

describe("renderer-html", () => {
  test("blockquote", () => {
    let doc = new OffsetSource({
      content: "Hello",
      annotations: [new Blockquote({ start: 0, end: 5 })]
    });

    expect(Renderer.render(doc)).toEqual("<blockquote>Hello</blockquote>");
  });

  test("bold", () => {
    let doc = new OffsetSource({
      content: "Hello",
      annotations: [new Bold({ start: 0, end: 5 })]
    });

    expect(Renderer.render(doc)).toEqual("<strong>Hello</strong>");
  });

  test("code", () => {
    let code = new Code({ start: 0, end: 5 });
    let doc = new OffsetSource({
      content: "Hello",
      annotations: [code]
    });

    expect(Renderer.render(doc)).toEqual("<code>Hello</code>");

    code.attributes.style = "block";
    expect(Renderer.render(doc)).toEqual("<pre><code>Hello</code></pre>");
  });

  describe("heading", () => {
    test.each([1, 2, 3, 4, 5, 6] as const)("level %s", level => {
      let doc = new OffsetSource({
        content: "Hello",
        annotations: [new Heading({ start: 0, end: 5, attributes: { level } })]
      });

      expect(Renderer.render(doc)).toEqual(`<h${level}>Hello</h${level}>`);
    });
  });

  test("horizontal rule", () => {
    let doc = new OffsetSource({
      content: "\uFFFC",
      annotations: [new HorizontalRule({ start: 0, end: 1 })]
    });

    expect(Renderer.render(doc)).toEqual(`<hr />`);
  });

  test("image", () => {
    let image = new Image({
      start: 0,
      end: 1,
      attributes: {
        url:
          "https://media.newyorker.com/photos/5d30e1b9d957560008da95d7/master/w_1023,c_limit/Haigney-Hippo.gif",
        description: new ImageDescriptionSource({
          content: "Hippo Hula Hooping",
          annotations: []
        }),
        title: "Haigney Hippo"
      }
    });

    let doc = new OffsetSource({
      content: "\uFFFC",
      annotations: [image]
    });

    expect(Renderer.render(doc)).toEqual(
      `<img src="https://media.newyorker.com/photos/5d30e1b9d957560008da95d7/master/w_1023,c_limit/Haigney-Hippo.gif" title="Haigney Hippo" alt="Hippo Hula Hooping" />`
    );

    delete image.attributes.title;
    expect(Renderer.render(doc)).toEqual(
      `<img src="https://media.newyorker.com/photos/5d30e1b9d957560008da95d7/master/w_1023,c_limit/Haigney-Hippo.gif" alt="Hippo Hula Hooping" />`
    );
  });

  test("italic", () => {
    let doc = new OffsetSource({
      content: "Hello",
      annotations: [new Italic({ start: 0, end: 5 })]
    });

    expect(Renderer.render(doc)).toEqual("<em>Hello</em>");
  });

  test("line break", () => {
    let doc = new OffsetSource({
      content: "\uFFFC",
      annotations: [new LineBreak({ start: 0, end: 1 })]
    });

    expect(Renderer.render(doc)).toEqual(`<br />`);
  });

  test("link", () => {
    let doc = new OffsetSource({
      content: "Hello",
      annotations: [
        new Link({
          start: 0,
          end: 5,
          attributes: {
            url: "https://condenast.com",
            title: "Condé Nast"
          }
        })
      ]
    });

    expect(Renderer.render(doc)).toEqual(
      `<a href="https://condenast.com" title="Condé Nast">Hello</a>`
    );
  });

  describe("ordered list", () => {
    test("default start position", () => {
      let doc = new OffsetSource({
        content: "one\ntwo",
        annotations: [
          new List({
            start: 0,
            end: 7,
            attributes: {
              type: "numbered"
            }
          }),
          new ListItem({ start: 0, end: 3 }),
          new ListItem({ start: 4, end: 7 })
        ]
      });
      expect(Renderer.render(doc)).toEqual(
        `<ol><li>one</li>\n<li>two</li></ol>`
      );
    });

    test("start position", () => {
      let doc = new OffsetSource({
        content: "one\ntwo",
        annotations: [
          new List({
            start: 0,
            end: 7,
            attributes: {
              type: "numbered",
              startsAt: 3
            }
          }),
          new ListItem({ start: 0, end: 3 }),
          new ListItem({ start: 4, end: 7 })
        ]
      });
      expect(Renderer.render(doc)).toEqual(
        `<ol starts=3><li>one</li>\n<li>two</li></ol>`
      );
    });

    test("compact", () => {
      let doc = new OffsetSource({
        content: "one\ntwo",
        annotations: [
          new List({
            start: 0,
            end: 7,
            attributes: {
              type: "numbered",
              tight: true
            }
          }),
          new ListItem({ start: 0, end: 3 }),
          new ListItem({ start: 4, end: 7 })
        ]
      });
      expect(Renderer.render(doc)).toEqual(
        `<ol compact><li>one</li>\n<li>two</li></ol>`
      );
    });
  });

  describe("unordered list", () => {
    test("default delimiter", () => {
      let doc = new OffsetSource({
        content: "one\ntwo",
        annotations: [
          new List({
            start: 0,
            end: 7,
            attributes: {
              type: "bulleted"
            }
          }),
          new ListItem({ start: 0, end: 3 }),
          new ListItem({ start: 4, end: 7 })
        ]
      });
      expect(Renderer.render(doc)).toEqual(
        `<ul><li>one</li>\n<li>two</li></ul>`
      );
    });

    test("different delimiter", () => {
      let doc = new OffsetSource({
        content: "one\ntwo",
        annotations: [
          new List({
            start: 0,
            end: 7,
            attributes: {
              type: "bulleted",
              delimiter: "square"
            }
          }),
          new ListItem({ start: 0, end: 3 }),
          new ListItem({ start: 4, end: 7 })
        ]
      });
      expect(Renderer.render(doc)).toEqual(
        `<ul type="square"><li>one</li>\n<li>two</li></ul>`
      );
    });
  });

  test("paragraph", () => {
    let doc = new OffsetSource({
      content: "Hello",
      annotations: [new Paragraph({ start: 0, end: 5 })]
    });

    expect(Renderer.render(doc)).toEqual("<p>Hello</p>");
  });

  test("subscript", () => {
    let doc = new OffsetSource({
      content: "Hello",
      annotations: [new Subscript({ start: 0, end: 5 })]
    });

    expect(Renderer.render(doc)).toEqual("<sub>Hello</sub>");
  });

  test("superscript", () => {
    let doc = new OffsetSource({
      content: "Hello",
      annotations: [new Superscript({ start: 0, end: 5 })]
    });

    expect(Renderer.render(doc)).toEqual("<sup>Hello</sup>");
  });

  test("underline", () => {
    let doc = new OffsetSource({
      content: "Hello",
      annotations: [new Underline({ start: 0, end: 5 })]
    });

    expect(Renderer.render(doc)).toEqual("<u>Hello</u>");
  });
});
