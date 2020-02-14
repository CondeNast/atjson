import Document from "@atjson/document";
import MarkdownIt = require("markdown-it");
export * from "./annotations";

import Parser from "./parser";
import { CommonMarkSchema } from "./schema";
export default CommonMarkSchema;
export * from "./converter";

export function fromRaw(
  markdown: string,
  options = {
    parser: MarkdownIt("commonmark"),
    handlers: {},
    schema: CommonMarkSchema
  }
) {
  let md = options.parser;
  let parser = new Parser(
    md.parse(markdown, { linkify: false }),
    options.handlers
  );

  return new Document({
    content: parser.content,
    annotations: parser.annotations,
    schema: options.schema
  });
}
