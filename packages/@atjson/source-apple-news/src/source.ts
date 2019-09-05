import Document from "@atjson/document";
import schema from "./annotations";
import * as AppleNewsFormat from "./apple-news-format";
import Parser from "./parser";

export { AppleNewsFormat };

export default class AppleNewsSource extends Document {
  static schema = schema;
  static contentType = "application/vnd.atjson+apple-news";

  static fromRaw(article: AppleNewsFormat.ArticleDocument) {
    let { content, annotations } = new Parser(article);

    return new this({
      content,
      annotations
    });
  }
}
