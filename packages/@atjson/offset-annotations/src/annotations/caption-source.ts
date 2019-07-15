import Document from '@atjson/document';
import Bold from './bold';
import Italic from './italic';
import LineBreak from './line-break';
import Link from './link';
import List from './list';
import ListItem from './list-item';
import Paragraph from './paragraph';
import Strikethrough from './strikethrough';
import Subscript from './subscript';
import Superscript from './superscript';
import Underline from './underline';

export default class CaptionSource extends Document {
  static contentType = 'application/vnd.atjson+offset-caption';
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
