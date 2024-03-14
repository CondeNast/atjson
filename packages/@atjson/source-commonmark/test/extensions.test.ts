import {
  InlineAnnotation,
  getConverterFor,
  is,
  serialize,
} from "@atjson/document";
import OffsetSource from "@atjson/offset-annotations";
import MarkdownIt from "markdown-it";
import CommonmarkSource from "../src";
import { render } from "./utils";

class StrikeThrough extends InlineAnnotation {
  static vendorPrefix = "commonmark";
  static type = "s";
}

class MarkdownItSource extends CommonmarkSource {
  static contentType = "application.vnd.atjson+markdownit";
  static schema = [...CommonmarkSource.schema, StrikeThrough];
  static get markdownParser() {
    return MarkdownIt();
  }
}

MarkdownItSource.defineConverterTo(OffsetSource, (doc) => {
  let convertCommonmark = getConverterFor(CommonmarkSource, OffsetSource);
  convertCommonmark(doc);
  doc.where({ type: "-commonmark-s" }).set({ type: "-offset-strikethrough" });

  return doc;
});

describe("strikethrough", () => {
  test("~~hello~~ is converted to strikethrough annotations", () => {
    let doc = MarkdownItSource.fromRaw("~~hello~~").withStableIds();
    expect(render(doc)).toBe("hello\n\n");
    let strikeThrough = doc.where((a) => is(a, StrikeThrough));
    expect(strikeThrough.toJSON()).toMatchInlineSnapshot(`
      [
        {
          "attributes": {},
          "end": 7,
          "id": "00000003",
          "start": 1,
          "type": "-commonmark-s",
        },
      ]
    `);
  });

  test("conversion to Offset uses existing conversions", () => {
    let doc = MarkdownItSource.fromRaw("~~hello~~ *world*")
      .convertTo(OffsetSource)
      .withStableIds();
    expect(
      doc
        .where((a) => a.type !== "parse-token")
        .sort()
        .toJSON()
    ).toMatchInlineSnapshot(`
      [
        {
          "attributes": {},
          "end": 14,
          "id": "00000001",
          "start": 0,
          "type": "-offset-paragraph",
        },
        {
          "attributes": {},
          "end": 7,
          "id": "00000003",
          "start": 1,
          "type": "-offset-strikethrough",
        },
        {
          "attributes": {},
          "end": 14,
          "id": "00000005",
          "start": 8,
          "type": "-offset-italic",
        },
      ]
    `);
  });
});

describe("tables", () => {
  const tableExample = `
| name     | age |
| -------- | --- |
| laios    | 20  |
| marcille | 500 |
`;
  test("parsing", () => {
    expect(
      serialize(MarkdownItSource.fromRaw(tableExample), { withStableIds: true })
    ).toMatchSnapshot();
  });

  test("converting", () => {
    let doc = MarkdownItSource.fromRaw(tableExample).withStableIds();

    expect(
      serialize(doc.convertTo(OffsetSource), { withStableIds: true })
    ).toMatchSnapshot();
  });
});
