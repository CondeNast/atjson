import { InlineAnnotation, getConverterFor } from "@atjson/document";
import OffsetSource from "@atjson/offset-annotations";
import * as MarkdownIt from "markdown-it";
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

MarkdownItSource.defineConverterTo(OffsetSource, doc => {
  let convertCommonmark = getConverterFor(CommonmarkSource, OffsetSource);
  convertCommonmark(doc);
  doc.where({ type: "-commonmark-s" }).set({ type: "-offset-strikethrough" });

  return doc;
});

describe("strikethrough", () => {
  test("~~hello~~ is converted to strikethrough annotations", () => {
    let doc = MarkdownItSource.fromRaw("~~hello~~");
    expect(render(doc)).toBe("hello\n\n");
    let strikeThrough = doc.where(a => a instanceof StrikeThrough);
    expect(strikeThrough.toJSON()).toEqual([
      {
        id: "Any<id>",
        type: "-commonmark-s",
        attributes: {},
        start: 1,
        end: 8
      }
    ]);
  });

  test("conversion to Offset uses existing conversions", () => {
    let doc = MarkdownItSource.fromRaw("~~hello~~ *world*").convertTo(
      OffsetSource
    );
    expect(
      doc
        .where(a => a.type !== "parse-token")
        .sort()
        .toJSON()
    ).toEqual([
      {
        id: "Any<id>",
        type: "-offset-paragraph",
        attributes: {},
        start: 0,
        end: 17
      },
      {
        id: "Any<id>",
        type: "-offset-strikethrough",
        attributes: {},
        start: 1,
        end: 8
      },
      {
        id: "Any<id>",
        type: "-offset-italic",
        attributes: {},
        start: 9,
        end: 16
      }
    ]);
  });
});
