import { Converter, InlineAnnotation } from "@atjson/document";
import OffsetSchema from "@atjson/schema-offset":
import * as MarkdownIt from "markdown-it";
import CommonmarkSchema, { convertToOffset, fromRaw } from "../src";
import { render } from "./utils";
import {  } from "@atjson/document/test/text-schema-test";

class StrikeThrough extends InlineAnnotation {
  static vendorPrefix = "commonmark";
  static type = "s";
}

const MarkdownItSchema = {
  annotations: {
    ...CommonmarkSchema.annotations,
    StrikeThrough
  }
} as const;

function fromMarkdownIt(markdown: string, options = { parser: MarkdownIt(), handlers: {}, schema: MarkdownItSchema }) {
  return fromRaw(markdown, options);
}

let converter = convertToOffset.extend(MarkdownItSchema, OffsetSchema, doc => {
  doc.where({ type: "-commonmark-s" }).set({ type: "-offset-strikethrough" });

  return doc;
});

describe("strikethrough", () => {
  test("~~hello~~ is converted to strikethrough annotations", () => {
    let doc = fromMarkdownIt("~~hello~~");
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
    let doc = converter.convert(fromMarkdownIt("~~hello~~ *world*"));
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
