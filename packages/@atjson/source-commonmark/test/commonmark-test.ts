import { HIR } from "@atjson/hir";
import CommonMarkSource from "../src";
import { render } from "./utils";

describe("whitespace", () => {
  test("&nbsp; is translated to a non-breaking space", () => {
    let doc = CommonMarkSource.fromRaw("&nbsp;");
    expect(render(doc)).toBe("\u00A0\n\n");
  });

  test("  \\n is converted to a hardbreak", () => {
    let doc = CommonMarkSource.fromRaw("1  \n2");
    expect(render(doc)).toBe("1\n2\n\n");
  });

  describe("non-breaking spaces", () => {
    test("html entities are converted to unicode characters", () => {
      let doc = CommonMarkSource.fromRaw("1\n\n&#8239;\n\n&nbsp;&emsp;\n\n2");
      let hir = new HIR(doc);
      expect(hir.toJSON()).toMatchObject({
        type: "root",
        attributes: {},
        children: [
          {
            type: "paragraph",
            attributes: {},
            children: ["1"],
          },
          {
            type: "paragraph",
            attributes: {},
            children: ["\u202F"],
          },
          {
            type: "paragraph",
            attributes: {},
            children: ["\u00A0\u2003"],
          },
          {
            type: "paragraph",
            attributes: {},
            children: ["2"],
          },
        ],
      });
    });

    test("empty paragraphs are created using narrow no-break unicode characters", () => {
      let doc = CommonMarkSource.fromRaw("1\n\n\u202F\n\n\u00A0\n\n2");
      let hir = new HIR(doc);
      expect(hir.toJSON()).toMatchObject({
        type: "root",
        attributes: {},
        children: [
          {
            type: "paragraph",
            attributes: {},
            children: ["1"],
          },
          {
            type: "paragraph",
            attributes: {},
            children: ["\u202F"],
          },
          {
            type: "paragraph",
            attributes: {},
            children: ["\u202F"],
          },
          {
            type: "paragraph",
            attributes: {},
            children: ["2"],
          },
        ],
      });
    });
  });
});

describe("code blocks", () => {
  test("` `` ` is converted to an inline code block", () => {
    let doc = CommonMarkSource.fromRaw("` `` `");
    expect(render(doc)).toBe(" `` \n\n");
  });
});

describe("list", () => {
  test("nested lists", () => {
    let doc = CommonMarkSource.fromRaw("- 1\n   - 2\n      - 3");
    expect(render(doc)).toBe("1\n2\n3\n");
  });

  test("tight", () => {
    let tight = CommonMarkSource.fromRaw("- 1\n   - 2\n      - 3");
    let list = tight.where({ type: "-commonmark-bullet_list" });
    expect(list.map((a) => a.toJSON())).toMatchObject([
      {
        type: "-commonmark-bullet_list",
        attributes: {
          "-commonmark-tight": true,
        },
      },
      {
        type: "-commonmark-bullet_list",
        attributes: {
          "-commonmark-tight": true,
        },
      },
      {
        type: "-commonmark-bullet_list",
        attributes: {
          "-commonmark-tight": true,
        },
      },
    ]);

    let loose = CommonMarkSource.fromRaw("1. 1\n\n   2. 2\n   3. 3");
    list = loose.where({ type: "-commonmark-ordered_list" });
    expect(list.map((a) => a.toJSON())).toMatchObject([
      {
        type: "-commonmark-ordered_list",
        attributes: {
          "-commonmark-start": 2,
          "-commonmark-tight": true,
        },
      },
      {
        type: "-commonmark-ordered_list",
        attributes: {
          "-commonmark-tight": false,
        },
      },
    ]);
  });
});

describe("images", () => {
  test("alt text is stripped", () => {
    let doc = CommonMarkSource.fromRaw(
      "![Markdown **is stripped** from *this*](test.jpg)"
    ).canonical();
    expect(doc.annotations).toMatchObject([
      {
        type: "paragraph",
      },
      {
        type: "image",
        attributes: {
          src: "test.jpg",
          alt: "Markdown is stripped from this",
        },
      },
    ]);
  });

  test("title", () => {
    let doc = CommonMarkSource.fromRaw(
      '![](test.jpg "Title of test.jpg")'
    ).canonical();
    expect(doc.annotations).toMatchObject([
      {
        type: "paragraph",
      },
      {
        type: "image",
        attributes: {
          src: "test.jpg",
          title: "Title of test.jpg",
          alt: "",
        },
      },
    ]);
  });
});
