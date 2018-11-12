import Document from '@atjson/document';
import {
  Anchor,
  Blockquote,
  Bold,
  Break,
  Code,
  DeletedText,
  Emphasis,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  HorizontalRule,
  Image,
  Italic,
  ListItem,
  OrderedList,
  Paragraph,
  PreformattedText,
  Strikethrough,
  Strong,
  Subscript,
  Superscript,
  Underline,
  UnorderedList
} from './annotations';
import Parser from './parser';

export default class HTMLSource extends Document {
  static contentType = 'application/vnd.atjson+html';
  static schema = [
    Anchor,
    Bold,
    Blockquote,
    Break,
    Code,
    DeletedText,
    Emphasis,
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    Heading5,
    Heading6,
    HorizontalRule,
    Italic,
    Image,
    ListItem,
    OrderedList,
    Paragraph,
    PreformattedText,
    Strikethrough,
    Strong,
    Subscript,
    Superscript,
    Underline,
    UnorderedList
  ];
  static fromSource(html: string) {
    let parser = new Parser(html);
    return new this({
      content: parser.content,
      annotations: parser.annotations
    });
  }
}
