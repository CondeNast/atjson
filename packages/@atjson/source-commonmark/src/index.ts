import "./converter";

export * from "./annotations";
export { default as schema } from "./schema";

import Document from "@atjson/document";
import * as MarkdownIt from "markdown-it";
import Parser from "./parser";
import schema from "./schema";

export default function(
  markdown: string,
  options: {
    parser: MarkdownIt;
    contentHandlers: any;
  } = {
    parser: MarkdownIt("commonmark"),
    contentHandlers: {}
  }
) {
  let md = options.parser || MarkdownIt();
  let parser = new Parser(
    md.parse(markdown, { linkify: false }),
    options.contentHandlers
  );

  return new Document({
    content: parser.content,
    annotations: parser.annotations,
    schema
  });
}
