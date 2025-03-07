import OffsetSource, {
  AudioEnvironments,
  Blockquote,
  Bold,
  CerosEmbed,
  CneAudioEmbed,
  CneEventRegistrationEmbed,
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
  Underline,
  TextAlignment,
} from "@atjson/offset-annotations";
import { ParseAnnotation, serialize } from "@atjson/document";
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
        ["start", TextAlignment.Start],
        ["center", TextAlignment.Center],
        ["end", TextAlignment.End],
        ["justify", TextAlignment.Justify],
      ] as const)("%s", (textAlign, textAlignment) => {
        test.each([1, 2, 3, 4, 5, 6] as const)("level %s", (level) => {
          let doc = new OffsetSource({
            content: "Hello",
            annotations: [
              new Heading({
                start: 0,
                end: 5,
                attributes: {
                  level,
                  textAlignment,
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
        `<a href="https://en.wiktionary.org/wiki/%E6%97%A5%E6%9C%AC%E4%BA%BA">日本人</a>`
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
        ["start", TextAlignment.Start],
        ["center", TextAlignment.Center],
        ["end", TextAlignment.End],
        ["justify", TextAlignment.Justify],
      ] as const)("%s", (textAlign, textAlignment) => {
        let doc = new OffsetSource({
          content: "Hello",
          annotations: [
            new Paragraph({
              start: 0,
              end: 5,
              attributes: { textAlignment },
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

  test("cneaudio", () => {
    let docProductionEnv = new OffsetSource({
      content: "\uFFFC",
      annotations: [
        new CneAudioEmbed({
          start: 0,
          end: 1,
          attributes: {
            audioEnv: AudioEnvironments.Production,
            anchorName: "podcast",
            audioType: "episode",
            audioId: "bb2ef05b-de71-469a-b0a5-829f2a54dac6",
          },
        }),
        new ParseAnnotation({
          start: 0,
          end: 1,
        }),
      ],
    });

    let docSandboxEnv = new OffsetSource({
      content: "\uFFFC",
      annotations: [
        new CneAudioEmbed({
          start: 0,
          end: 1,
          attributes: {
            audioEnv: AudioEnvironments.Sandbox,
            anchorName: "podcast",
            audioType: "episode",
            audioId: "bb2ef05b-de71-469a-b0a5-829f2a54dac6",
          },
        }),
        new ParseAnnotation({
          start: 0,
          end: 1,
        }),
      ],
    });

    expect(
      Renderer.render(serialize(docProductionEnv, { withStableIds: true }))
    ).toMatchInlineSnapshot(
      `"<iframe id="podcast" src="https://embed-audio.cnevids.com/iframe/episode/bb2ef05b-de71-469a-b0a5-829f2a54dac6" frameborder="0" height="244" sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"></iframe>"`
    );

    expect(
      Renderer.render(serialize(docSandboxEnv, { withStableIds: true }))
    ).toMatchInlineSnapshot(
      `"<iframe id="podcast" src="https://embed-audio-sandbox.cnevids.com/iframe/episode/bb2ef05b-de71-469a-b0a5-829f2a54dac6" frameborder="0" height="244" sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"></iframe>"`
    );
  });

  describe("Cne Event Registration", () => {
    test("baseurl only", () => {
      let doc = new OffsetSource({
        content: "\uFFFC",
        annotations: [
          new CneEventRegistrationEmbed({
            start: 0,
            end: 1,
            attributes: {
              url: "https://baseurl",
            },
          }),
          new ParseAnnotation({ start: 0, end: 1 }),
        ],
      });

      expect(
        Renderer.render(serialize(doc, { withStableIds: true }))
      ).toMatchInlineSnapshot(
        `"<cne-event-registration url="https://baseurl"></cne-event-registration>"`
      );
    });
    test("full param", () => {
      let doc = new OffsetSource({
        content: "\uFFFC",
        annotations: [
          new CneEventRegistrationEmbed({
            start: 0,
            end: 1,
            attributes: {
              url: "https://baseurl?loggedout=loggedoutslug&loggedin=loggedinslug&privacy=true",
            },
          }),
          new ParseAnnotation({ start: 0, end: 1 }),
        ],
      });

      expect(
        Renderer.render(serialize(doc, { withStableIds: true }))
      ).toMatchInlineSnapshot(
        `"<cne-event-registration url="https://baseurl?loggedout=loggedoutslug&amp;loggedin=loggedinslug&amp;privacy=true"></cne-event-registration>"`
      );
    });
  });
});
