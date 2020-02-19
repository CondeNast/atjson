import { HIR } from "@atjson/hir";
import HTMLSource from "../src";

describe("@atjson/source-html", () => {
  describe("parser", () => {
    test("leading whitespace parsed correctly", () => {
      let doc = HTMLSource.fromRaw(
        " leading <strong>whitespace</strong>"
      ).canonical();
      expect(doc).toMatchObject({
        content: "leading whitespace",
        annotations: [
          {
            type: "strong",
            start: 8,
            end: 18
          }
        ]
      });
    });
    test("annotation wraps start and end tags", () => {
      let doc = HTMLSource.fromRaw("<p>Paragraph with <b>bold</b></p>");

      expect(doc.annotations.sort()).toMatchObject([
        {
          type: "parse-token",
          start: 0,
          end: 3,
          attributes: { reason: "<p>" }
        },
        {
          type: "parse-token",
          start: 18,
          end: 21,
          attributes: { reason: "<b>" }
        },
        {
          type: "parse-token",
          start: 25,
          end: 29,
          attributes: { reason: "</b>" }
        },
        { type: "b", start: 18, end: 29 },
        {
          type: "parse-token",
          start: 29,
          end: 33,
          attributes: { reason: "</p>" }
        },
        { type: "p", start: 0, end: 33 }
      ]);
    });

    test("annotation wraps self-closing tags", () => {
      let doc = HTMLSource.fromRaw("<p>Paragraph with <img/></p>");

      expect(doc.annotations.sort()).toMatchObject([
        {
          type: "parse-token",
          start: 0,
          end: 3,
          attributes: { reason: "<p>" }
        },
        {
          type: "parse-token",
          start: 18,
          end: 24,
          attributes: { reason: "<img>" }
        },
        { type: "img", start: 18, end: 24 },
        {
          type: "parse-token",
          start: 24,
          end: 28,
          attributes: { reason: "</p>" }
        },
        { type: "p", start: 0, end: 28 }
      ]);
    });

    test("annotation wraps unclosed tags", () => {
      let doc = HTMLSource.fromRaw(
        "<p>Paragraph with no closing<p>New paragraph</p>"
      );

      expect(doc.annotations.sort()).toMatchObject([
        {
          type: "parse-token",
          start: 0,
          end: 3,
          attributes: { reason: "<p>" }
        },
        { type: "p", start: 0, end: 28 },
        {
          type: "parse-token",
          start: 28,
          end: 31,
          attributes: { reason: "<p>" }
        },
        {
          type: "parse-token",
          start: 44,
          end: 48,
          attributes: { reason: "</p>" }
        },
        { type: "p", start: 28, end: 48 }
      ]);
    });
  });

  test("dataset", () => {
    let doc = HTMLSource.fromRaw(
      '<div class="spaceship" data-ship-id="92432" data-weapons="kittens"></div>'
    );
    expect(doc.where({ type: "-html-div" }).toJSON()).toMatchObject([
      {
        type: "-html-div",
        attributes: {
          "-html-class": "spaceship",
          "-html-dataset": {
            "-html-ship-id": "92432",
            "-html-weapons": "kittens"
          }
        }
      }
    ]);
  });

  test("pre-code", () => {
    let doc = HTMLSource.fromRaw(
      "<pre><code>this <b>is</b> a test</code></pre>"
    );
    let hir = new HIR(doc).toJSON();

    expect(hir).toMatchObject({
      type: "root",
      attributes: {},
      children: [
        {
          type: "pre",
          attributes: {},
          children: [
            {
              type: "code",
              attributes: {},
              children: [
                "this ",
                {
                  type: "b",
                  attributes: {},
                  children: ["is"]
                },
                " a test"
              ]
            }
          ]
        }
      ]
    });
  });

  test("<p>aaa<br />\nbbb</p>", () => {
    let doc = HTMLSource.fromRaw("<p>aaa<br />\nbbb</p>");
    let hir = new HIR(doc).toJSON();
    expect(hir).toMatchObject({
      type: "root",
      attributes: {},
      children: [
        {
          type: "p",
          attributes: {},
          children: [
            "aaa",
            { type: "br", attributes: {}, children: [] },
            "\nbbb"
          ]
        }
      ]
    });
  });

  test('<a href="https://example.com">example</a>', () => {
    let doc = HTMLSource.fromRaw('<a href="https://example.com">example</a>');
    let hir = new HIR(doc).toJSON();

    expect(hir).toMatchObject({
      type: "root",
      attributes: {},
      children: [
        {
          type: "a",
          attributes: {
            href: "https://example.com"
          },
          children: ["example"]
        }
      ]
    });
  });

  test('<img src="https://example.com/test.png" /> ', () => {
    let doc = HTMLSource.fromRaw('<img src="https://example.com/test.png" /> ');
    let hir = new HIR(doc).toJSON();
    expect(hir).toMatchObject({
      type: "root",
      attributes: {},
      children: [
        {
          type: "img",
          attributes: {
            src: "https://example.com/test.png"
          },
          children: []
        }
      ]
    });
  });

  test("<h2></h2>\n<h1></h1>\n<h3></h3>", () => {
    let doc = HTMLSource.fromRaw("<h2></h2>\n<h1></h1>\n<h3></h3>");
    let hir = new HIR(doc).toJSON();
    expect(hir).toMatchObject({
      type: "root",
      attributes: {},
      children: [
        {
          type: "h2",
          attributes: {},
          children: []
        },
        "\n",
        {
          type: "h1",
          attributes: {},
          children: []
        },
        "\n",
        {
          type: "h3",
          attributes: {},
          children: []
        }
      ]
    });
  });

  test('<p><img src="/url" alt="Foo" title="title" /></p>', () => {
    let doc = HTMLSource.fromRaw(
      '<p><img src="/url" alt="Foo" title="title" /></p>'
    );
    let hir = new HIR(doc).toJSON();
    expect(hir).toMatchObject({
      type: "root",
      attributes: {},
      children: [
        {
          type: "p",
          attributes: {},
          children: [
            {
              type: "img",
              attributes: {
                src: "/url",
                alt: "Foo",
                title: "title"
              },
              children: []
            }
          ]
        }
      ]
    });
  });

  test('<p>**<a href="**"></p>', () => {
    let doc = HTMLSource.fromRaw('<p>**<a href="**"></p>');
    let hir = new HIR(doc).toJSON();
    expect(hir).toMatchObject({
      type: "root",
      attributes: {},
      children: [
        {
          type: "p",
          attributes: {},
          children: [
            "**",
            {
              type: "a",
              attributes: {
                href: "**"
              },
              children: []
            }
          ]
        }
      ]
    });
  });

  test("&lt;&gt;", () => {
    let doc = HTMLSource.fromRaw("&lt;&gt;");
    let hir = new HIR(doc).toJSON();
    expect(hir).toMatchObject({
      type: "root",
      attributes: {},
      children: ["<>"]
    });
  });

  test("entities in attributes", () => {
    let doc = HTMLSource.fromRaw(
      `<a href="https://example.com?q=this%20is%20a%20search" title="&quot;test&quot; &lt;tag&gt;">Test</a>`
    );
    expect(doc.canonical()).toMatchObject({
      content: "Test",
      annotations: [
        {
          type: "a",
          start: 0,
          end: 4,
          attributes: {
            href: "https://example.com?q=this is a search",
            title: `"test" <tag>`
          }
        }
      ]
    });
  });

  test('<a href="https://en.wiktionary.org/wiki/%E6%97%A5%E6%9C%AC%E4%BA%BA">&#x65E5;&#x672C;&#x4EBA;</a>', () => {
    let doc = HTMLSource.fromRaw(
      '<a href="https://en.wiktionary.org/wiki/%E6%97%A5%E6%9C%AC%E4%BA%BA">&#x65E5;&#x672C;&#x4EBA;</a>'
    );
    let hir = new HIR(doc).toJSON();
    expect(hir).toMatchObject({
      type: "root",
      attributes: {},
      children: [
        {
          type: "a",
          attributes: {
            href: "https://en.wiktionary.org/wiki/日本人"
          },
          children: ["日本人"]
        }
      ]
    });
  });

  test('<!DOCTYPE html><html lang="en"><body>Hello</body></html>', () => {
    let doc = HTMLSource.fromRaw(
      '<!DOCTYPE html><html lang="en"><body>Hello</body></html>'
    );

    expect([...doc.where({ type: "-html-body" })]).toMatchObject([
      {
        start: 31,
        end: 49
      }
    ]);
    expect(doc.content).toEqual(
      '<!DOCTYPE html><html lang="en"><body>Hello</body></html>'
    );

    let canonical = doc.canonical();
    expect(canonical.content).toEqual("Hello");
    expect(canonical.annotations).toMatchObject([
      {
        type: "body",
        start: 0,
        end: 5
      },
      {
        type: "html",
        start: 0,
        end: 5,
        attributes: {
          lang: "en"
        }
      }
    ]);
  });

  test('<html lang="en"><body>Hello</body></html>', () => {
    let doc = HTMLSource.fromRaw('<html lang="en"><body>Hello</body></html>');

    expect([...doc.where({ type: "-html-body" })]).toMatchObject([
      {
        start: 16,
        end: 34
      }
    ]);
    expect(doc.content).toEqual('<html lang="en"><body>Hello</body></html>');

    let canonical = doc.canonical();
    expect(canonical.content).toEqual("Hello");
    expect(canonical.annotations).toMatchObject([
      {
        type: "body",
        start: 0,
        end: 5
      },
      {
        type: "html",
        start: 0,
        end: 5,
        attributes: {
          lang: "en"
        }
      }
    ]);
  });
});
