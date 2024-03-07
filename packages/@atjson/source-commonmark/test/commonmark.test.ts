import { serialize } from "@atjson/document";
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
      expect(serialize(doc)).toMatchObject({
        text: "\uFFFC1\uFFFC\u202F\uFFFC\u00A0\u2003\uFFFC2",
        blocks: [
          {
            type: "paragraph",
          },
          {
            type: "paragraph",
          },
          {
            type: "paragraph",
          },
          {
            type: "paragraph",
          },
        ],
      });
    });

    test("empty paragraphs are created using narrow no-break unicode characters", () => {
      let doc = CommonMarkSource.fromRaw("1\n\n\u202F\n\n\u00A0\n\n2");
      expect(serialize(doc)).toMatchObject({
        text: "\uFFFC1\uFFFC\u202F\uFFFC\u202F\uFFFC2",
        blocks: [
          {
            type: "paragraph",
          },
          {
            type: "paragraph",
          },
          {
            type: "paragraph",
          },
          {
            type: "paragraph",
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
          "-commonmark-loose": false,
        },
      },
      {
        type: "-commonmark-bullet_list",
        attributes: {
          "-commonmark-loose": false,
        },
      },
      {
        type: "-commonmark-bullet_list",
        attributes: {
          "-commonmark-loose": false,
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
          "-commonmark-loose": false,
        },
      },
      {
        type: "-commonmark-ordered_list",
        attributes: {
          "-commonmark-loose": true,
        },
      },
    ]);
  });
});

describe("images", () => {
  test("alt text is stripped", () => {
    expect(
      serialize(
        CommonMarkSource.fromRaw(
          "![Markdown **is stripped** from *this*](test.jpg)"
        )
      )
    ).toMatchObject({
      text: "\uFFFC\uFFFC",
      blocks: [
        {
          type: "paragraph",
        },
        {
          type: "image",
          parents: ["paragraph"],
          selfClosing: true,
          attributes: {
            src: "test.jpg",
            alt: "Markdown is stripped from this",
          },
        },
      ],
    });
  });

  test("title", () => {
    expect(
      serialize(CommonMarkSource.fromRaw('![](test.jpg "Title of test.jpg")'))
    ).toMatchObject({
      text: "\uFFFC\uFFFC",
      blocks: [
        {
          type: "paragraph",
        },
        {
          type: "image",
          parents: ["paragraph"],
          selfClosing: true,
          attributes: {
            src: "test.jpg",
            title: "Title of test.jpg",
            alt: "",
          },
        },
      ],
    });
  });
});
