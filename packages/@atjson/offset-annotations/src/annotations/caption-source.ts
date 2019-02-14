import Document from '@atjson/document';
import {
  Bold,
  Italic,
  LineBreak,
  Link,
  List,
  ListItem,
  Paragraph,
  Strikethrough,
  Subscript,
  Superscript,
  Underline
} from './index';

export default class CaptionSource extends Document {
  static schema = [
    Bold,
    Italic,
    LineBreak,
    Link,
    List,
    ListItem,
    Paragraph,
    Subscript,
    Strikethrough,
    Superscript,
    Underline
  ];
}
