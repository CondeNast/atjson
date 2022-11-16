import OffsetSource, {
  Blockquote,
  Bold,
  CerosEmbed,
  Code,
  CodeBlock,
  Heading,
  HorizontalRule,
  Image,
  Italic,
  LineBreak,
  Link,
  List,
  ListItem,
  Paragraph,
  Section,
  SmallCaps,
  Strikethrough,
  Subscript,
  Superscript,
  TikTokEmbed,
  Underline,
} from "@atjson/offset-annotations";
import { ParseAnnotation } from "@atjson/document";
import Renderer from "../src";

describe("renderer-html", () => {
  test("blockquote", () => {
    let doc = new OffsetSource({
      content: "Hello",
      annotations: [new Blockquote({ start: 0, end: 5 })],
    });

    expect(Renderer.render(doc)).toEqual("<blockquote>Hello</blockquote>");
  });

  test("bold", () => {
    let doc = new OffsetSource({
      content: "Hello",
      annotations: [new Bold({ start: 0, end: 5 })],
    });

    expect(Renderer.render(doc)).toEqual("<strong>Hello</strong>");
  });

  test("code", () => {
    let code = new Code({ start: 0, end: 5 });
    let doc = new OffsetSource({
      content: "Hello",
      annotations: [code],
    });

    expect(Renderer.render(doc)).toEqual("<code>Hello</code>");
  });

  test("code block", () => {
    let code = new CodeBlock({
      start: 0,
      end: 5,
    });
    let doc = new OffsetSource({
      content: "Hello",
      annotations: [code],
    });

    expect(Renderer.render(doc)).toEqual("<pre><code>Hello</code></pre>");

    code.attributes.info = "html";
    expect(Renderer.render(doc)).toEqual(
      `<pre class="html"><code>Hello</code></pre>`
    );
  });

  describe("heading", () => {
    test.each([1, 2, 3, 4, 5, 6] as const)("level %s", (level) => {
      let doc = new OffsetSource({
        content: "Hello",
        annotations: [new Heading({ start: 0, end: 5, attributes: { level } })],
      });

      expect(Renderer.render(doc)).toEqual(`<h${level}>Hello</h${level}>`);
    });

    test.each([1, 2, 3, 4, 5, 6] as const)("anchorName %s", (level) => {
      let doc = new OffsetSource({
        content: "Hello",
        annotations: [
          new Heading({
            start: 0,
            end: 5,
            attributes: { level, anchorName: `test-${level}` },
          }),
        ],
      });

      expect(Renderer.render(doc)).toEqual(
        `<h${level} id="test-${level}">Hello</h${level}>`
      );
    });

    describe("alignment", () => {
      describe.each([
        ["left", "start"],
        ["center", "center"],
        ["right", "end"],
        ["justify", "justify"],
      ] as const)("%s", (textAlign, alignment) => {
        test.each([1, 2, 3, 4, 5, 6] as const)("level %s", (level) => {
          let doc = new OffsetSource({
            content: "Hello",
            annotations: [
              new Heading({
                start: 0,
                end: 5,
                attributes: {
                  level,
                  alignment,
                },
              }),
            ],
          });

          expect(Renderer.render(doc)).toEqual(
            `<h${level} style="text-align:${textAlign};">Hello</h${level}>`
          );
        });
      });
    });
  });

  test("horizontal rule", () => {
    let doc = new OffsetSource({
      content: "\uFFFC",
      annotations: [
        new HorizontalRule({ start: 0, end: 1 }),
        new ParseAnnotation({
          start: 0,
          end: 1,
        }),
      ],
    });

    expect(Renderer.render(doc)).toEqual(`<hr />`);
  });

  test("image", () => {
    let image = new Image({
      start: 0,
      end: 1,
      attributes: {
        url: "https://media.newyorker.com/photos/5d30e1b9d957560008da95d7/master/w_1023,c_limit/Haigney-Hippo.gif",
        description: "Hippo Hula Hooping",
        title: "Haigney Hippo",
      },
    });

    let doc = new OffsetSource({
      content: "\uFFFC",
      annotations: [
        image,
        new ParseAnnotation({
          start: 0,
          end: 1,
        }),
      ],
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
      annotations: [new Italic({ start: 0, end: 5 })],
    });

    expect(Renderer.render(doc)).toEqual("<em>Hello</em>");
  });

  test("line break", () => {
    let doc = new OffsetSource({
      content: "\uFFFC",
      annotations: [
        new LineBreak({ start: 0, end: 1 }),
        new ParseAnnotation({
          start: 0,
          end: 1,
        }),
      ],
    });

    expect(Renderer.render(doc)).toEqual(`<br />`);
  });

  describe("links", () => {
    test("url / title, rel, target", () => {
      let doc = new OffsetSource({
        content: "Hello",
        annotations: [
          new Link({
            start: 0,
            end: 5,
            attributes: {
              url: "https://condenast.com",
              title: "Condé Nast",
              rel: "nofollow",
              target: "_blank",
            },
          }),
        ],
      });

      expect(Renderer.render(doc)).toEqual(
        `<a href="https://condenast.com" title="Cond&#xe9; Nast" rel="nofollow" target="_blank">Hello</a>`
      );
    });

    test("URL encoding", () => {
      let doc = new OffsetSource({
        content: "日本人",
        annotations: [
          new Link({
            start: 0,
            end: 6,
            attributes: {
              url: "https://en.wiktionary.org/wiki/日本人",
            },
          }),
        ],
      });

      expect(Renderer.render(doc)).toEqual(
        `<a href="https://en.wiktionary.org/wiki/%E6%97%A5%E6%9C%AC%E4%BA%BA">&#x65e5;&#x672c;&#x4eba;</a>`
      );
    });

    test("entity escapes", () => {
      let doc = new OffsetSource({
        content: "Test",
        annotations: [
          new Link({
            start: 0,
            end: 4,
            attributes: {
              url: "https://example.com?q=this is a search",
              title: `"test" <tag>`,
            },
          }),
        ],
      });

      expect(Renderer.render(doc)).toEqual(
        `<a href="https://example.com?q=this%20is%20a%20search" title="&quot;test&quot; &lt;tag&gt;">Test</a>`
      );
    });
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
              type: "numbered",
            },
          }),
          new ListItem({ start: 0, end: 3 }),
          new ListItem({ start: 4, end: 7 }),
        ],
      });
      expect(Renderer.render(doc)).toEqual(
        `<ol compact><li>one</li>\n<li>two</li></ol>`
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
              startsAt: 3,
            },
          }),
          new ListItem({ start: 0, end: 3 }),
          new ListItem({ start: 4, end: 7 }),
        ],
      });
      expect(Renderer.render(doc)).toEqual(
        `<ol starts=3 compact><li>one</li>\n<li>two</li></ol>`
      );
    });

    test("loose", () => {
      let doc = new OffsetSource({
        content: "one\ntwo",
        annotations: [
          new List({
            start: 0,
            end: 7,
            attributes: {
              type: "numbered",
              loose: true,
            },
          }),
          new ListItem({ start: 0, end: 3 }),
          new ListItem({ start: 4, end: 7 }),
        ],
      });
      expect(Renderer.render(doc)).toEqual(
        `<ol><li>one</li>\n<li>two</li></ol>`
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
              type: "bulleted",
            },
          }),
          new ListItem({ start: 0, end: 3 }),
          new ListItem({ start: 4, end: 7 }),
        ],
      });
      expect(Renderer.render(doc)).toEqual(
        `<ul compact><li>one</li>\n<li>two</li></ul>`
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
              delimiter: "square",
            },
          }),
          new ListItem({ start: 0, end: 3 }),
          new ListItem({ start: 4, end: 7 }),
        ],
      });
      expect(Renderer.render(doc)).toEqual(
        `<ul compact type="square"><li>one</li>\n<li>two</li></ul>`
      );
    });
  });

  describe("paragraph", () => {
    test("paragraph", () => {
      let doc = new OffsetSource({
        content: "Hello",
        annotations: [new Paragraph({ start: 0, end: 5 })],
      });

      expect(Renderer.render(doc)).toEqual("<p>Hello</p>");
    });

    test("anchorName", () => {
      let doc = new OffsetSource({
        content: "Hello",
        annotations: [
          new Paragraph({
            start: 0,
            end: 5,
            attributes: { anchorName: "test" },
          }),
        ],
      });

      expect(Renderer.render(doc)).toEqual(`<p id="test">Hello</p>`);
    });

    describe("alignment", () => {
      describe.each([
        ["left", "start"],
        ["center", "center"],
        ["right", "end"],
        ["justify", "justify"],
      ] as const)("%s", (textAlign, alignment) => {
        let doc = new OffsetSource({
          content: "Hello",
          annotations: [
            new Paragraph({
              start: 0,
              end: 5,
              attributes: { alignment },
            }),
          ],
        });

        expect(Renderer.render(doc)).toEqual(
          `<p style="text-align:${textAlign};">Hello</p>`
        );
      });
    });
  });

  test("section", () => {
    let doc = new OffsetSource({
      content: "Text in a paragraph in a section.",
      annotations: [
        new Section({ start: 0, end: 33 }),
        new Paragraph({ start: 0, end: 33 }),
      ],
    });

    expect(Renderer.render(doc)).toEqual(
      "<section><p>Text in a paragraph in a section.</p></section>"
    );
  });

  test("smallcaps", () => {
    let doc = new OffsetSource({
      content: "Text with smallcaps.",
      annotations: [new SmallCaps({ start: 10, end: 19 })],
    });

    expect(Renderer.render(doc)).toEqual(
      'Text with <span class="smallcaps">smallcaps</span>.'
    );
  });

  test("strikethrough", () => {
    let doc = new OffsetSource({
      content: "Hello",
      annotations: [new Strikethrough({ start: 0, end: 5 })],
    });

    expect(Renderer.render(doc)).toEqual("<s>Hello</s>");
  });

  test("subscript", () => {
    let doc = new OffsetSource({
      content: "Hello",
      annotations: [new Subscript({ start: 0, end: 5 })],
    });

    expect(Renderer.render(doc)).toEqual("<sub>Hello</sub>");
  });

  test("superscript", () => {
    let doc = new OffsetSource({
      content: "Hello",
      annotations: [new Superscript({ start: 0, end: 5 })],
    });

    expect(Renderer.render(doc)).toEqual("<sup>Hello</sup>");
  });

  test("underline", () => {
    let doc = new OffsetSource({
      content: "Hello",
      annotations: [new Underline({ start: 0, end: 5 })],
    });

    expect(Renderer.render(doc)).toEqual("<u>Hello</u>");
  });

  describe("ceros", () => {
    test("without mobile aspect ratio", () => {
      let doc = new OffsetSource({
        content: "\uFFFC",
        annotations: [
          new CerosEmbed({
            id: "test",
            start: 0,
            end: 1,
            attributes: {
              anchorName: "carousel",
              url: "//view.ceros.com/ceros-inspire/carousel-3",
              aspectRatio: 2,
            },
          }),
          new ParseAnnotation({
            start: 0,
            end: 1,
          }),
        ],
      });

      expect(Renderer.render(doc)).toMatchInlineSnapshot(
        `"<div style="position: relative;width: auto;padding: 0 0 50%;height: 0;top: 0;left: 0;bottom: 0;right: 0;margin: 0;border: 0 none" id="experience-test" data-aspectRatio="2"><iframe allowfullscreen src="//view.ceros.com/ceros-inspire/carousel-3" id="carousel" style="position: absolute;top: 0;left: 0;bottom: 0;right: 0;margin: 0;padding: 0;border: 0 none;height: 1px;width: 1px;min-height: 100%;min-width: 100%" frameborder="0" class="ceros-experience" scrolling="no"></iframe></div><script type="text/javascript" src="//view.ceros.com/scroll-proxy.min.js" data-ceros-origin-domains="view.ceros.com"></script>"`
      );
    });

    test("with mobile aspect ratio", () => {
      let doc = new OffsetSource({
        content: "\uFFFC",
        annotations: [
          new CerosEmbed({
            id: "test",
            start: 0,
            end: 1,
            attributes: {
              url: "//view.ceros.com/ceros-inspire/carousel-3",
              aspectRatio: 2,
              mobileAspectRatio: 3,
            },
          }),
          new ParseAnnotation({
            start: 0,
            end: 1,
          }),
        ],
      });

      expect(Renderer.render(doc)).toMatchInlineSnapshot(
        `"<div style="position: relative;width: auto;padding: 0 0 50%;height: 0;top: 0;left: 0;bottom: 0;right: 0;margin: 0;border: 0 none" id="experience-test" data-aspectRatio="2" data-mobile-aspectRatio="3"><iframe allowfullscreen src="//view.ceros.com/ceros-inspire/carousel-3" style="position: absolute;top: 0;left: 0;bottom: 0;right: 0;margin: 0;padding: 0;border: 0 none;height: 1px;width: 1px;min-height: 100%;min-width: 100%" frameborder="0" class="ceros-experience" scrolling="no"></iframe></div><script type="text/javascript" src="//view.ceros.com/scroll-proxy.min.js" data-ceros-origin-domains="view.ceros.com"></script>"`
      );
    });
  });

  test("tiktok", () => {
    let doc = new OffsetSource({
      content: "\uFFFC",
      annotations: [
        new TikTokEmbed({
          start: 0,
          end: 1,
          attributes: {
            url: "https://www.tiktok.com/@vogueitalia/video/6771026615137750277",
          },
        }),
        new ParseAnnotation({
          start: 0,
          end: 1,
        }),
      ],
    });

    expect(Renderer.render(doc)).toEqual(
      `<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@vogueitalia/video/6771026615137750277" data-video-id="6771026615137750277" style="max-width: 605px;min-width: 325px;"><section><a target="_blank" title="@vogueitalia" href="https://www.tiktok.com/@vogueitalia">@vogueitalia</a></section></blockquote><script async src="https://www.tiktok.com/embed.js"></script>`
    );
  });
});
