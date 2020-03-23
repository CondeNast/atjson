import Document from "@atjson/document";
import {
  Bold,
  Heading,
  HorizontalRule,
  Italic,
  Link,
  List,
  ListItem,
  Strikethrough,
  Underline,
  VerticalAdjust,
} from "./annotations";

import GDocsParser, { GDocsPasteBuffer } from "./gdocs-parser";

export default class extends Document {
  static contentType = "application/vnd.atjson+gdocs";
  static schema = [
    Bold,
    Heading,
    HorizontalRule,
    Italic,
    Link,
    List,
    ListItem,
    Strikethrough,
    Underline,
    VerticalAdjust,
  ];
  static fromRaw(pasteBuffer: GDocsPasteBuffer) {
    let gDocsParser = new GDocsParser(pasteBuffer);

    return new this({
      content: gDocsParser.getContent(),
      annotations: gDocsParser.getAnnotations(),
    });
  }
}
