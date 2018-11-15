import Document, { ObjectAnnotation } from '@atjson/document';
import Bold from './bold';
import Code from './code';
import Italic from './italic';
import LineBreak from './line-break';
import Link from './link';
import Strikethrough from './strikethrough';
import Subscript from './subscript';
import Superscript from './superscript';
import Underline from './underline';

export class ImageDescriptionSource extends Document {
  static contentType = 'application/vnd.atjson+offset;image.description';
  static schema = [
    Bold,
    Code,
    Italic,
    LineBreak,
    Link,
    Strikethrough,
    Subscript,
    Superscript,
    Underline
  ];
}

export default class ImageAnnotation extends ObjectAnnotation {
  static vendorPrefix = 'offset';
  static type = 'image';
  static subdocuments = {
    description: ImageDescriptionSource
  };
  attributes!: {
    url: string;
    title: string;
    description: ImageDescriptionSource;
  };
}
