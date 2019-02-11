import Document, { BlockAnnotation, InlineAnnotation, ObjectAnnotation } from '@atjson/document';

export class Bold extends InlineAnnotation {
  static vendorPrefix = 'test';
  static type = 'Bold';
}

export class Blockquote extends BlockAnnotation {
  static vendorPrefix = 'test';
  static type = 'Blockquote';
}

export class Italic extends InlineAnnotation {
  static vendorPrefix = 'test';
  static type = 'Italic';
}

export class CaptionSource extends Document {
  static contentType = 'application/vnd.atjson+caption';
  static schema = [Bold, Italic];
}

export class Image extends ObjectAnnotation {
  static vendorPrefix = 'test';
  static type = 'Image';
  static subdocuments = { caption: CaptionSource };
}

export class ListItem extends BlockAnnotation {
  static vendorPrefix = 'test';
  static type = 'ListItem';
}

export class OrderedList extends BlockAnnotation {
  static vendorPrefix = 'test';
  static type = 'OrderedList';
}

export class Paragraph extends BlockAnnotation {
  static vendorPrefix = 'test';
  static type = 'Paragraph';

  get rank() {
    return super.rank * 3 / 2;
  }
}

export default class TestSource extends Document {
  static contentType = 'application/vnd.atjson+test';
  static schema = [Bold, Image, Italic, ListItem, OrderedList, Paragraph];
}
