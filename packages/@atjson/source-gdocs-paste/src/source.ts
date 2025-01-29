import Document from "@atjson/document";
import {
  Alignment,
  Bold,
  FontSize,
  Heading,
  HorizontalRule,
  IndentLeft,
  Italic,
  Link,
  List,
  ListItem,
  SmallCaps,
  Strikethrough,
  Underline,
  VerticalAdjust,
} from "./annotations";

import GDocsParser, { GDocsPasteBuffer } from "./gdocs-parser";

export default class extends Document {
  static contentType = "application/vnd.atjson+gdocs";
  static schema = [
    Alignment,
    Bold,
    FontSize,
    Heading,
    HorizontalRule,
    IndentLeft,
    Italic,
    Link,
    List,
    ListItem,
    SmallCaps,
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
