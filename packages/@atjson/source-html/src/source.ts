import Document from "@atjson/document";
import * as annotations from "./annotations";
import Parser from "./parser";

export default class HTMLSource extends Document {
  static contentType = "application/vnd.atjson+html";
  static schema = Object.values(annotations);
  static fromRaw(html: string) {
    let parser = new Parser(html);
    return new this({
      content: parser.content,
      annotations: parser.annotations,
    });
  }
}
