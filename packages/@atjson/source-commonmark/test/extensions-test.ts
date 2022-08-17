import { InlineAnnotation, getConverterFor, is } from "@atjson/document";
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
      Array [
        Object {
          "attributes": Object {},
          "end": 8,
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
      Array [
        Object {
          "attributes": Object {},
          "end": 17,
          "id": "00000001",
          "start": 0,
          "type": "-offset-paragraph",
        },
        Object {
          "attributes": Object {},
          "end": 8,
          "id": "00000003",
          "start": 1,
          "type": "-offset-strikethrough",
        },
        Object {
          "attributes": Object {},
          "end": 16,
          "id": "00000006",
          "start": 9,
          "type": "-offset-italic",
        },
      ]
    `);
  });
});
