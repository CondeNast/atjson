import Document, {
  BlockAnnotation,
  InlineAnnotation,
  ObjectAnnotation,
} from "@atjson/document";

export class Bold extends InlineAnnotation {
  static vendorPrefix = "test";
  static type = "bold";
}

export class Blockquote extends BlockAnnotation {
  static vendorPrefix = "test";
  static type = "blockquote";
}

export class Italic extends InlineAnnotation {
  static vendorPrefix = "test";
  static type = "italic";
}

export class CaptionSource extends Document {
  static contentType = "application/vnd.atjson+caption";
  static schema = [Bold, Italic];
}

export class Image extends ObjectAnnotation {
  static vendorPrefix = "test";
  static type = "image";
  static subdocuments = { caption: CaptionSource };
}

export class ListItem extends BlockAnnotation {
  static vendorPrefix = "test";
  static type = "list-item";
}

export class OrderedList extends BlockAnnotation {
  static vendorPrefix = "test";
  static type = "ordered-list";
}

export class Paragraph extends BlockAnnotation {
  static vendorPrefix = "test";
  static type = "paragraph";

  get rank() {
    return (super.rank * 3) / 2;
  }
}

export default class TestSource extends Document {
  static contentType = "application/vnd.atjson+test";
  static schema = [Bold, Image, Italic, ListItem, OrderedList, Paragraph];
}
