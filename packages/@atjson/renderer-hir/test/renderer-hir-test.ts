/**
 * @jest-environment jsdom
 */

import Document, {
  Annotation,
  BlockAnnotation,
  InlineAnnotation,
  SliceAnnotation,
} from "@atjson/document";
import { HIR, TextAnnotation } from "@atjson/hir";
import HIRRenderer, { Context, escapeHTML } from "../src/index";

class Bold extends InlineAnnotation {
  static vendorPrefix = "test";
  static type = "bold";
}

class Link extends InlineAnnotation<{ href: string }> {
  static vendorPrefix = "test";
  static type = "link";
}

class Italic extends InlineAnnotation {
  static vendorPrefix = "test";
  static type = "italic";
}

class BlockQuote extends BlockAnnotation<{ credit?: string }> {
  static vendorPrefix = "test";
  static type = "block-quote";
}

class Citation extends InlineAnnotation<{ citations: string[] }> {
  static vendorPrefix = "test";
  static type = "citation";
}

class Spoiler extends InlineAnnotation<{ spoiler: string }> {
  static vendorPrefix = "test";
  static type = "spoiler";
}

class TestSource extends Document {
  static contentType = "application/vnd.atjson+test";
  static schema = [Bold, Italic, BlockQuote, Citation, Link, Spoiler];
}

function text(t: string, start: number): Annotation<any> {
  return new TextAnnotation({
    id: "XXXXXXXX",
    start,
    end: start + t.length,
    attributes: {
      text: t,
    },
  });
}

describe("@atjson/renderer-hir", () => {
  it("defines an abstract rendering interface", () => {
    let atjson = new TestSource({
      content: "This is bold and italic text",
      annotations: [
        {
          type: "-test-bold",
          start: 8,
          end: 17,
          attributes: {},
        },
        {
          type: "-test-italic",
          start: 12,
          end: 23,
          attributes: {},
        },
      ],
    }).withStableIds();

    let root = new HIR(atjson).rootNode;
    root.id = "00000000";
    let [, bold, italic] = root.children();
    let boldAndItalic = bold.children()[1];

    let callStack = [
      {
        annotation: bold.annotation,
        parent: root.annotation,
        previous: text("This is ", 0),
        next: italic.annotation,
        children: [text("bold", 8), boldAndItalic.annotation],
      },
      {
        annotation: boldAndItalic.annotation,
        parent: bold.annotation,
        previous: text("bold", 8),
        next: null,
        children: [text(" and ", 12)],
      },
      {
        annotation: italic.annotation,
        parent: root.annotation,
        previous: bold.annotation,
        next: text(" text", 23),
        children: [text("italic", 17)],
      },
    ];

    let textBuilder: string[] = [
      " and ",
      "bold and ",
      "italic",
      "This is bold and italic text",
    ];

    class ConcreteRenderer extends HIRRenderer {
      *renderAnnotation(
        annotation: Annotation<any>,
        context: Context
      ): Iterator<void, string, string[]> {
        let expected = callStack.shift() as Context & {
          annotation: Annotation<any>;
        };
        expect(annotation.toJSON()).toMatchObject(expected.annotation.toJSON());

        if (parent) {
          let { id, ...json } = expected.parent.toJSON();
          expect(context.parent.toJSON()).toMatchObject(json);
        } else {
          expect(context.parent).toBe(expected.parent);
        }

        if (context.previous != null && expected.previous != null) {
          let { id, ...json } = expected.previous.toJSON();
          expect(context.previous.toJSON()).toMatchObject(json);
        } else {
          expect(context.previous).toBe(expected.previous);
        }

        if (context.next != null && expected.next != null) {
          let { id, ...json } = expected.next.toJSON();
          expect(context.next.toJSON()).toMatchObject(json);
        } else {
          expect(context.next).toBe(expected.next);
        }

        expect(context.children.map((a) => a.toJSON())).toMatchObject(
          expected.children.map((a) => ({
            ...a.toJSON(),
            id: expect.anything(),
          }))
        );

        let rawText: string[] = yield;
        expect(rawText.join("")).toEqual(textBuilder.shift());
        return rawText.join("");
      }

      *root() {
        let rawText: string[] = yield;
        expect(rawText.join("")).toEqual(textBuilder.shift());
        return rawText.join("");
      }
    }

    ConcreteRenderer.render(atjson);
  });

  it("escapes HTML entities in text", () => {
    let atjson = new TestSource({
      content: `This <html-element with="param" and-another='param'> should render as plain text`,
      annotations: [],
    });

    class ConcreteRenderer extends HIRRenderer {
      text(t: string): string {
        return escapeHTML(t);
      }
      *root(): Iterator<void, string, string[]> {
        let rawText: string[] = yield;
        return rawText.join("");
      }
      *renderAnnotation(): Iterator<void, string, string[]> {
        let rawText: string[] = yield;
        return rawText.join("");
      }
    }

    expect(ConcreteRenderer.render(atjson)).toBe(
      "This &lt;html-element with&#x3D;&quot;param&quot; and-another&#x3D;&#x27;param&#x27;&gt; should render as plain text"
    );
  });

  it("will look at the type to call the rendering part on", () => {
    let doc = new TestSource({
      content: "I am very excited",
      annotations: [
        new BlockQuote({ start: 0, end: 17 }),
        new Bold({ start: 0, end: 17 }),
        new Italic({ start: 5, end: 9 }),
      ],
    });

    class SlackRenderer extends HIRRenderer {
      *"block-quote"() {
        let words = yield;
        return `> ${words.join("")}`;
      }

      *bold() {
        let words = yield;
        return `*${words.join("")}*`;
      }

      *italic() {
        let words = yield;
        return `_${words.join("")}_`;
      }

      *root(): Iterator<void, string, string[]> {
        let rawText: string[] = yield;
        return rawText.join("");
      }
    }

    expect(SlackRenderer.render(doc)).toBe("> *I am _very_ excited*");
  });

  it("does a class-like lookup for rendering", () => {
    let doc = new TestSource({
      content: "I am very excited",
      annotations: [
        new BlockQuote({ start: 0, end: 17 }),
        new Bold({ start: 0, end: 17 }),
        new Italic({ start: 5, end: 9 }),
      ],
    });

    class SlackRenderer extends HIRRenderer {
      *BlockQuote() {
        let words = yield;
        return `> ${words.join("")}`;
      }

      *Bold() {
        let words = yield;
        return `*${words.join("")}*`;
      }

      *Italic() {
        let words = yield;
        return `_${words.join("")}_`;
      }

      *root(): Iterator<void, string, string[]> {
        let rawText: string[] = yield;
        return rawText.join("");
      }
    }

    expect(SlackRenderer.render(doc)).toBe("> *I am _very_ excited*");
  });

  describe("slices", () => {
    test("top level keys are reified", () => {
      let doc = new TestSource({
        content:
          "The radio is stuck right now. Everything sound the same. As far as video-wise everything look the same. So we coming in to change the whole thing. Missy Elliott",
        annotations: [
          new BlockQuote({
            id: "a1",
            start: 0,
            end: 146,
            attributes: { credit: "a2" },
          }),
          new SliceAnnotation({
            id: "a2",
            start: 147,
            end: 160,
            attributes: { refs: ["a1"] },
          }),
          new Italic({ start: 147, end: 160 }),
        ],
      });

      class HTMLRenderer extends HIRRenderer {
        *BlockQuote(blockquote: BlockQuote) {
          let words = yield;
          return `<blockquote>${words.join("")}${
            blockquote.attributes.credit
              ? `<cite>${HTMLRenderer.render(
                  this.slice(blockquote.attributes.credit)
                )}</cite>`
              : ""
          }</blockquote>`;
        }

        *Bold() {
          let words = yield;
          return `<strong>${words.join("")}</strong>`;
        }

        *Italic() {
          let words = yield;
          return `<em>${words.join("")}</em>`;
        }

        *root(): Iterator<void, string, string[]> {
          let rawText: string[] = yield;
          return rawText.join("");
        }
      }

      expect(HTMLRenderer.render(doc)).toBe(
        "<blockquote>The radio is stuck right now. Everything sound the same. As far as video-wise everything look the same. So we coming in to change the whole thing.<cite><em>Missy Elliott</em></cite></blockquote> "
      );
    });

    test("arrays are reified", () => {
      let doc = new TestSource({
        content: `Arthur Baldwin Turnure, an American businessman, founded Vogue as a weekly newspaper based in New York City, sponsored by Kristoffer Wright, with its first issue on December 17, 1892.Rowlands, Penelope (2008) A Dash of Daring: Carmel Snow and Her Life In Fashion, Art, and Letters Simon & Schuster, 2008.Warren, Lynne (2005) Encyclopedia of Twentieth-Century Photography, 3-Volume Set Routledge, 2005`,
        annotations: [
          new Link({
            id: "a1",
            start: 0,
            end: 22,
            attributes: {
              href: "https://en.wikipedia.org/wiki/Arthur_Baldwin_Turnure",
            },
          }),
          new Italic({ id: "a2", start: 57, end: 62 }),
          new Link({
            id: "a3",
            start: 94,
            end: 107,
            attributes: {
              href: "https://en.wikipedia.org/wiki/New_York_City",
            },
          }),
          new Citation({
            id: "a4",
            start: 0,
            end: 183,
            attributes: {
              citations: ["a5", "a6"],
            },
          }),
          new SliceAnnotation({
            id: "a5",
            start: 183,
            end: 304,
            attributes: {
              refs: ["a4"],
            },
          }),
          new SliceAnnotation({
            id: "a6",
            start: 304,
            end: 400,
            attributes: {
              refs: ["a4"],
            },
          }),
        ],
      });

      class HTMLRenderer extends HIRRenderer {
        citations: string[];

        constructor(document: Document) {
          super(document);
          this.citations = [];
        }

        *Link(link: Link) {
          let words = yield;
          return `<a href="${link.attributes.href}">${words.join("")}</a>`;
        }

        *Citation(citation: Citation) {
          let words = yield;
          let start = this.citations.length + 1;
          this.citations.push(...citation.attributes.citations);
          return `${words.join("")}${citation.attributes.citations
            .map(
              (_, index) =>
                `<a href="#cite-${start + index}">[${start + index}]</a>`
            )
            .join("")}`;
        }

        *Bold() {
          let words = yield;
          return `<strong>${words.join("")}</strong>`;
        }

        *Italic() {
          let words = yield;
          return `<em>${words.join("")}</em>`;
        }

        *root(): Iterator<void, string, string[]> {
          let rawText: string[] = yield;
          return `${rawText.join("")}${
            this.citations.length
              ? `\n<ol>${this.citations
                  .map(
                    (citation, index) =>
                      `<li id="cite-${index + 1}">${HTMLRenderer.render(
                        this.slice(citation)
                      )}</li>`
                  )
                  .join("")}</ol>`
              : ""
          }`;
        }
      }

      expect(HTMLRenderer.render(doc)).toBe(
        `<a href="https://en.wikipedia.org/wiki/Arthur_Baldwin_Turnure">Arthur Baldwin Turnure</a>, an American businessman, founded <em>Vogue</em> as a weekly newspaper based in <a href="https://en.wikipedia.org/wiki/New_York_City">New York City</a>, sponsored by Kristoffer Wright, with its first issue on December 17, 1892.<a href="#cite-1">[1]</a><a href="#cite-2">[2]</a>\n` +
          `<ol><li id="cite-1">Rowlands, Penelope (2008) A Dash of Daring: Carmel Snow and Her Life In Fashion, Art, and Letters Simon & Schuster, 2008.</li><li id="cite-2">Warren, Lynne (2005) Encyclopedia of Twentieth-Century Photography, 3-Volume Set Routledge, 2005</li></ol>`
      );
    });

    test("document context is correct for documents with slices", () => {
      let atjson = new TestSource({
        content: "This document has a spoiler:\nThis is it!",
        annotations: [
          new Italic({ start: 0, end: 28 }),
          new Spoiler({
            start: 28,
            end: 40,
            attributes: { spoiler: "slice1" },
          }),
          new SliceAnnotation({ id: "slice1", start: 29, end: 40 }),
          new Bold({ start: 37, end: 39 }),
        ],
      });

      let callStack = [
        "This is it!",
        "This document has a spoiler:\nXXXXXXXXXX",
      ];

      class ConcreteRenderer extends HIRRenderer {
        *Italic(_, context) {
          expect(context.document.content).toEqual(
            "This document has a spoiler:\n"
          );
          return (yield).join("");
        }
        *Spoiler(spoiler, context) {
          let spoilerText =
            ConcreteRenderer.render(this.slice(spoiler.attributes.spoiler)) ??
            "";
          expect(context.document.content).toEqual(
            "This document has a spoiler:\n"
          );
          return (yield).join("") + "X".repeat(spoilerText.length - 1);
        }
        *Bold(_, context) {
          expect(context.document.content).toEqual("This is it!");
          return (yield).join("");
        }
        *root() {
          let results = (yield).join("");
          expect(results).toBe(callStack.shift());
          return results;
        }
      }

      expect(ConcreteRenderer.render(atjson)).toEqual(
        "This document has a spoiler:\nXXXXXXXXXX"
      );
    });
  });
});
