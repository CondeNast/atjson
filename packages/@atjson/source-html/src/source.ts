import Document from '@atjson/document';
import schema from './annotations';
import Parser from './parser';

export default class HTMLSource extends Document {
  static contentType = 'application/vnd.atjson+html';
  static schema = schema;
  static fromRaw(html: string) {
    let parser = new Parser(html);
    return new this({
      content: parser.content,
      annotations: parser.annotations
    });
  }
}
