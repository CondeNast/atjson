import Document from '@atjson/document';
import {
  Anchor,
  Aside,
  Blockquote,
  Bold,
  Code,
  Emphasis,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Image,
  Italic,
  ListItem,
  OrderedList,
  Paragraph,
  PullQuote,
  Strikethrough,
  Strong,
  Subscript,
  Superscript,
  Underline,
  UnorderedList
} from './annotations';
import Parser, { MobileDoc } from './parser';
import translate from './translate';

export default class MobileDocSource extends Document {
  static contentType = 'appplication/vnd.atjson+mobiledoc';
  static schema = [
    Anchor,
    Aside,
    Bold,
    Blockquote,
    Code,
    Emphasis,
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    Heading5,
    Heading6,
    Italic,
    Image,
    ListItem,
    OrderedList,
    Paragraph,
    PullQuote,
    Strikethrough,
    Strong,
    Subscript,
    Superscript,
    Underline,
    UnorderedList
  ];
  static fromSource(mobiledoc: MobileDoc) {
    let result = new Parser(mobiledoc);

    return new this({
      content: result.content,
      annotations: result.annotations
    });
  }

  toCommonSchema(): Document {
    return translate(this);
  }
}
