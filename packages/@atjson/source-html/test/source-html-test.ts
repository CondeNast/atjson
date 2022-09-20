import { serialize } from "@atjson/document";
import HTMLSource from "../src";

describe("@atjson/source-html", () => {
  describe("parser", () => {
    test("leading space parsed correctly", () => {
      expect(
        serialize(HTMLSource.fromRaw(" leading <strong>whitespace</strong>"))
      ).toMatchObject({
        text: "\uFFFC leading whitespace",
        marks: [
          {
            type: "strong",
            range: "(10..20]",
          },
        ],
      });
    });

    test("leading tab parsed correctly", () => {
      let doc = HTMLSource.fromRaw(
        "\tleading <strong>whitespace</strong>"
      ).canonical();
      expect(doc).toMatchObject({
        content: "\tleading whitespace",
        annotations: [
          {
            type: "strong",
            start: 9,
            end: 19,
          },
        ],
      });
    });

    test("annotation wraps start and end tags", () => {
      let doc = HTMLSource.fromRaw("<p>Paragraph with <b>bold</b></p>");

      expect(doc.annotations.sort()).toMatchObject([
        {
          type: "parse-token",
          start: 0,
          end: 3,
          attributes: { reason: "<p>" },
        },
        {
          type: "parse-token",
          start: 18,
          end: 21,
          attributes: { reason: "<b>" },
        },
        {
          type: "parse-token",
          start: 25,
          end: 29,
          attributes: { reason: "</b>" },
        },
        { type: "b", start: 18, end: 29 },
        {
          type: "parse-token",
          start: 29,
          end: 33,
          attributes: { reason: "</p>" },
        },
        { type: "p", start: 0, end: 33 },
      ]);
    });

    test("annotation wraps self-closing tags", () => {
      let doc = HTMLSource.fromRaw("<p>Paragraph with <img/></p>");

      expect(doc.annotations.sort()).toMatchObject([
        {
          type: "parse-token",
          start: 0,
          end: 3,
          attributes: { reason: "<p>" },
        },
        {
          type: "parse-token",
          start: 18,
          end: 24,
          attributes: { reason: "<img>" },
        },
        { type: "img", start: 18, end: 24 },
        {
          type: "parse-token",
          start: 24,
          end: 28,
          attributes: { reason: "</p>" },
        },
        { type: "p", start: 0, end: 28 },
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
          attributes: { reason: "<p>" },
        },
        { type: "p", start: 0, end: 28 },
        {
          type: "parse-token",
          start: 28,
          end: 31,
          attributes: { reason: "<p>" },
        },
        {
          type: "parse-token",
          start: 44,
          end: 48,
          attributes: { reason: "</p>" },
        },
        { type: "p", start: 28, end: 48 },
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
            "-html-weapons": "kittens",
          },
        },
      },
    ]);
  });

  test("pre-code", () => {
    let doc = HTMLSource.fromRaw(
      "<pre><code>this <b>is</b> a test</code></pre>"
    );

    // This is weird, but follows the HTML spec in terms
    // of what kinds of things these tags are
    expect(serialize(doc)).toMatchObject({
      text: "\uFFFCthis is a test",
      blocks: [
        {
          type: "text",
        },
      ],
      marks: [
        {
          type: "code",
          range: "(1..15]",
        },
        {
          type: "pre",
          range: "(1..15]",
        },
        {
          type: "b",
          range: "(6..8]",
        },
      ],
    });
  });

  test("<p>aaa<br />\nbbb</p>", () => {
    let doc = HTMLSource.fromRaw("<p>aaa<br />\nbbb</p>");
    expect(serialize(doc)).toMatchObject({
      text: "\uFFFCaaa\uFFFC\nbbb",
      blocks: [
        {
          type: "p",
        },
        {
          type: "br",
          selfClosing: true,
        },
      ],
      marks: [],
    });
  });

  test('<a href="https://example.com">example</a>', () => {
    let doc = HTMLSource.fromRaw('<a href="https://example.com">example</a>');
    expect(serialize(doc)).toMatchObject({
      text: "\uFFFCexample",
      blocks: [
        {
          type: "text",
        },
      ],
      marks: [
        {
          type: "a",
          range: "(1..8]",
          attributes: {
            href: "https://example.com",
          },
        },
      ],
    });
  });

  test('<img src="https://example.com/test.png" /> ', () => {
    let doc = HTMLSource.fromRaw('<img src="https://example.com/test.png" /> ');
    expect(serialize(doc)).toMatchObject({
      text: "\uFFFC\uFFFC ",
      blocks: [
        {
          type: "text",
        },
        {
          type: "img",
          parents: ["text"],
          selfClosing: true,
          attributes: {
            src: "https://example.com/test.png",
          },
        },
      ],
      marks: [],
    });
  });

  test("<h2></h2>\n<h1></h1>\n<h3></h3>", () => {
    let doc = HTMLSource.fromRaw("<h2></h2>\n<h1></h1>\n<h3></h3>");
    expect(serialize(doc)).toMatchObject({
      text: "\uFFFC\n\n",
      blocks: [
        {
          type: "text",
        },
      ],
      marks: [
        {
          type: "h2",
          range: "(1..1]",
        },
        {
          type: "h1",
          range: "(2..2]",
        },
        {
          type: "h3",
          range: "(3..3]",
        },
      ],
    });
  });

  test('<p><img src="/url" alt="Foo" title="title" /></p>', () => {
    let doc = HTMLSource.fromRaw(
      '<p><img src="/url" alt="Foo" title="title" /></p>'
    );
    expect(serialize(doc)).toMatchObject({
      text: "\uFFFC\uFFFC",
      blocks: [
        {
          type: "p",
        },
        {
          type: "img",
          parents: ["p"],
          attributes: {
            src: "/url",
            alt: "Foo",
            title: "title",
          },
        },
      ],
    });
  });

  test('<p>**<a href="**"></p>', () => {
    let doc = HTMLSource.fromRaw('<p>**<a href="**"></p>');
    expect(serialize(doc)).toMatchObject({
      text: "\uFFFC**",
      blocks: [
        {
          type: "p",
        },
      ],
      marks: [
        {
          type: "a",
          attributes: { href: "**" },
          range: "(3..3]",
        },
      ],
    });
  });

  test("&lt;&gt;", () => {
    let doc = HTMLSource.fromRaw("&lt;&gt;");
    expect(serialize(doc)).toMatchObject({
      text: "\uFFFC<>",
      blocks: [{ type: "text" }],
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
            title: `"test" <tag>`,
          },
        },
      ],
    });
  });

  test('<a href="https://en.wiktionary.org/wiki/%E6%97%A5%E6%9C%AC%E4%BA%BA">&#x65E5;&#x672C;&#x4EBA;</a>', () => {
    let doc = HTMLSource.fromRaw(
      '<a href="https://en.wiktionary.org/wiki/%E6%97%A5%E6%9C%AC%E4%BA%BA">&#x65E5;&#x672C;&#x4EBA;</a>'
    );
    expect(serialize(doc)).toMatchObject({
      text: "\uFFFC日本人",
      blocks: [{ type: "text" }],
      marks: [
        {
          type: "a",
          range: "(1..4]",
          attributes: {
            href: "https://en.wiktionary.org/wiki/日本人",
          },
        },
      ],
    });
  });

  test('<!DOCTYPE html><html lang="en"><body>Hello</body></html>', () => {
    let doc = HTMLSource.fromRaw(
      '<!DOCTYPE html><html lang="en"><body>Hello</body></html>'
    );

    expect([...doc.where({ type: "-html-body" })]).toMatchObject([
      {
        start: 31,
        end: 49,
      },
    ]);
    expect(doc.content).toEqual(
      '<!DOCTYPE html><html lang="en"><body>Hello</body></html>'
    );

    let canonical = doc.canonical();
    expect(canonical.content).toEqual("Hello");
    expect(canonical.annotations).toMatchObject([
      {
        type: "html",
        start: 0,
        end: 5,
        attributes: {
          lang: "en",
        },
      },
      {
        type: "body",
        start: 0,
        end: 5,
      },
    ]);
  });

  test('  \t<!DOCTYPE html><html lang="en"><body>Hello</body></html>', () => {
    let doc = HTMLSource.fromRaw(
      '  \t<!DOCTYPE html><html lang="en"><body>Hello</body></html>'
    );

    expect([...doc.where({ type: "-html-body" })]).toMatchObject([
      {
        start: 34,
        end: 52,
      },
    ]);
    expect(doc.content).toEqual(
      '  \t<!DOCTYPE html><html lang="en"><body>Hello</body></html>'
    );

    let canonical = doc.canonical();
    expect(canonical.content).toEqual("  \tHello");
    expect(canonical.annotations).toMatchObject([
      {
        type: "html",
        start: 3,
        end: 8,
        attributes: {
          lang: "en",
        },
      },
      {
        type: "body",
        start: 3,
        end: 8,
      },
    ]);
  });

  test('<html lang="en"><body>Hello</body></html>', () => {
    let doc = HTMLSource.fromRaw('<html lang="en"><body>Hello</body></html>');

    expect([...doc.where({ type: "-html-body" })]).toMatchObject([
      {
        start: 16,
        end: 34,
      },
    ]);
    expect(doc.content).toEqual('<html lang="en"><body>Hello</body></html>');

    let canonical = doc.canonical();
    expect(canonical.content).toEqual("Hello");
    expect(canonical.annotations).toMatchObject([
      {
        type: "html",
        start: 0,
        end: 5,
        attributes: {
          lang: "en",
        },
      },
      {
        type: "body",
        start: 0,
        end: 5,
      },
    ]);
  });
});
