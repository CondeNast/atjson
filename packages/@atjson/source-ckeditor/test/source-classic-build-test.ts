import DocumentFragment from "@ckeditor/ckeditor5-engine/src/model/documentfragment";
import CKEditorSource from "./source-ckeditor-build-classic";

describe("@atjson/source-ckeditor classic build", () => {
  test("single paragraph", () => {
    let ckDoc = DocumentFragment.fromJSON([
      {
        name: "paragraph",
        children: [
          {
            data: "Here is a paragraph",
          },
        ],
      },
    ]);
    let doc = CKEditorSource.fromRaw(ckDoc).canonical();

    expect(doc.content).toBe("Here is a paragraph");
    expect(doc.annotations).toMatchObject([
      {
        type: "$root",
        start: 0,
        end: 19,
      },
      {
        type: "paragraph",
        start: 0,
        end: 19,
      },
      {
        type: "$text",
        start: 0,
        end: 19,
      },
    ]);
  });

  test("multiple paragraphs", () => {
    let ckDoc = DocumentFragment.fromJSON([
      {
        name: "paragraph",
        children: [
          {
            data: "Here is a paragraph",
          },
        ],
      },
      {
        name: "paragraph",
        children: [
          {
            data: "Here is another paragraph",
          },
        ],
      },
    ]);
    let doc = CKEditorSource.fromRaw(ckDoc).canonical();

    expect(doc.content).toBe("Here is a paragraphHere is another paragraph");
    expect(doc.all().sort().annotations).toMatchObject([
      {
        type: "$root",
        start: 0,
        end: 44,
      },
      {
        type: "paragraph",
        start: 0,
        end: 19,
      },
      {
        type: "$text",
        start: 0,
        end: 19,
      },
      {
        type: "paragraph",
        start: 19,
        end: 44,
      },
      {
        type: "$text",
        start: 19,
        end: 44,
      },
    ]);
  });

  test("single text styles", () => {
    let ckDoc = DocumentFragment.fromJSON([
      {
        name: "paragraph",
        children: [
          {
            data: "Bold",
            attributes: { bold: true },
          },
          {
            data: " ",
          },
          {
            data: "italic",
            attributes: { italic: true },
          },
          {
            data: " ",
          },
          {
            data: "link",
            attributes: { linkHref: "https://www.condenast.com" },
          },
        ],
      },
    ]);
    let doc = CKEditorSource.fromRaw(ckDoc).canonical();

    expect(doc.content).toBe("Bold italic link");
    expect(doc.all().sort().annotations).toMatchObject([
      {
        type: "$root",
        start: 0,
        end: 16,
      },
      {
        type: "paragraph",
        start: 0,
        end: 16,
      },
      {
        type: "$text",
        start: 0,
        end: 4,
        attributes: { bold: true },
      },
      {
        type: "$text",
        start: 4,
        end: 5,
        attributes: {},
      },
      {
        type: "$text",
        start: 5,
        end: 11,
        attributes: { italic: true },
      },
      {
        type: "$text",
        start: 11,
        end: 12,
        attributes: {},
      },
      {
        type: "$text",
        start: 12,
        end: 16,
        attributes: { linkHref: "https://www.condenast.com" },
      },
    ]);
  });

  test("nested text styles", () => {
    let ckDoc = DocumentFragment.fromJSON([
      {
        name: "paragraph",
        children: [
          {
            data: "Bold and italic",
            attributes: { bold: true, italic: true },
          },
          {
            data: " ",
          },
          {
            data: "bold link",
            attributes: { bold: true, linkHref: "https://www.condenast.com" },
          },
          {
            data: " just bold",
            attributes: { bold: true },
          },
        ],
      },
    ]);
    let doc = CKEditorSource.fromRaw(ckDoc).canonical();

    expect(doc.content).toBe("Bold and italic bold link just bold");
    expect(doc.all().sort().annotations).toMatchObject([
      {
        type: "$root",
        start: 0,
        end: 35,
      },
      {
        type: "paragraph",
        start: 0,
        end: 35,
      },
      {
        type: "$text",
        start: 0,
        end: 15,
        attributes: {
          bold: true,
          italic: true,
        },
      },
      {
        type: "$text",
        start: 15,
        end: 16,
        attributes: {},
      },
      {
        type: "$text",
        start: 16,
        end: 25,
        attributes: {
          bold: true,
          linkHref: "https://www.condenast.com",
        },
      },
      {
        type: "$text",
        start: 25,
        end: 35,
        attributes: { bold: true },
      },
    ]);
  });

  test("update children start/end positions to enforce nesting hierarchy", () => {
    let ckDoc = DocumentFragment.fromJSON([
      {
        name: "listItem",
        attributes: { listIndent: 0, listType: "numbered" },
        children: [
          {
            data: "List item 1",
          },
        ],
      },
    ]);
    let doc = CKEditorSource.fromRaw(ckDoc);

    expect(doc.content).toBe("<$root><listItem>List item 1</listItem></$root>");
    expect(doc.all().sort().annotations).toMatchObject([
      {
        type: "$root",
        start: 0,
        end: 47,
        attributes: {},
      },
      {
        type: "parse-token",
        start: 0,
        end: 7,
        attributes: {
          ref: expect.anything(),
        },
      },
      {
        type: "listItem",
        start: 7,
        end: 39,
        attributes: {
          listIndent: 0,
          listType: "numbered",
        },
      },
      {
        type: "parse-token",
        start: 7,
        end: 17,
        attributes: {
          ref: expect.anything(),
        },
      },
      {
        type: "$text",
        start: 17,
        end: 28,
        attributes: {},
      },
      {
        type: "parse-token",
        start: 28,
        end: 39,
        attributes: {
          ref: expect.anything(),
        },
      },
      {
        type: "parse-token",
        start: 39,
        end: 47,
        attributes: {
          ref: expect.anything(),
        },
      },
    ]);
  });
});
