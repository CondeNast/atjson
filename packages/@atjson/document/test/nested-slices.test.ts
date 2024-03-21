import Renderer from "@atjson/renderer-hir";

test("mutiple slice hops", () => {
  class ConcreteRenderer extends Renderer {
    *Image(block: {
      id: string;
      selfClosing: boolean;
      parents: string[];
      attributes: { credit: string; href: string };
    }) {
      let slice = this.getSlice(block.attributes.credit);
      if (!slice) throw new Error("credit slice not found");
      let credit =
        this.render(slice || { blocks: [], marks: [], text: "" }) ??
        "CREDIT ERROR";
      return `<figure><img src="${block.attributes.href}" /><figcaption>${credit}</figcaption></figure>`;
    }
    *Footnote() {
      return `<aside>${(yield).join("")}</aside>`;
    }
    *Paragraph() {
      return `<p>${(yield).join("")}</p>`;
    }
    *FootnoteLink(mark: {
      id: string;
      type: string;
      range: Range;
      attributes: { footnote: string };
    }) {
      let slice = this.getSlice(mark.attributes.footnote);
      if (!slice) throw new Error("footnote slice not found");
      let footnote = this.render(slice) ?? "FOOTNOTE ERROR";
      return `<a>${(yield).join("")}</a>${footnote}`;
    }
    *root() {
      return (yield).join("");
    }
  }

  expect(
    ConcreteRenderer.render({
      text: "\uFFFCText that refers to footnote\uFFFCThis is the footnote and has an image \uFFFCCredit: foo",
      blocks: [
        {
          id: "B0",
          type: "paragraph",
          selfClosing: false,
          parents: [],
          attributes: {},
        },
        {
          id: "B1",
          type: "footnote",
          selfClosing: false,
          parents: [],
          attributes: {},
        },
        {
          id: "B2",
          type: "image",
          selfClosing: false,
          parents: ["footnote"],
          attributes: {
            href: "my-little-pony.gif",
            credit: "M2",
          },
        },
      ],
      marks: [
        {
          id: "M0",
          type: "footnote-link",
          range: "[21..29]",
          attributes: {
            footnote: "M1",
          },
        },
        {
          id: "M1",
          type: "slice",
          range: "[29..69]",
          attributes: {
            refs: ["M0"],
          },
        },
        {
          id: "M2",
          type: "slice",
          range: "[69..80]",
          attributes: {
            refs: ["B2"],
          },
        },
      ],
    })
  ).toEqual(
    `<p>Text that refers to <a>footnote</a><aside>This is the footnote and has an image <figure><img src="my-little-pony.gif" /><figcaption>Credit: foo</figcaption></figure></aside></p>`
  );
});
