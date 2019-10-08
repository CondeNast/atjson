import Document from "@atjson/document";
import "./converter";
import Parser from "./parser";
import schema from "./schema";

export default schema;

export function fromRaw(html: string) {
  let parser = new Parser(html);
  return new Document({
    content: parser.content,
    annotations: parser.annotations,
    schema
  });
}
