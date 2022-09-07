import Document, {
  Change,
  EdgeBehaviour,
  InlineAnnotation,
  Insertion,
  ObjectAnnotation,
  BlockAnnotation,
} from "../src";

export class Anchor extends InlineAnnotation<{
  href: string;
  target?: string | null;
}> {
  static vendorPrefix = "test";
  static type = "a";
  static edgeBehaviour = {
    leading: EdgeBehaviour.preserve,
    trailing: EdgeBehaviour.preserve,
  };
}

export class Bold extends InlineAnnotation {
  static vendorPrefix = "test";
  static type = "bold";
}

export class Italic extends InlineAnnotation {
  static vendorPrefix = "test";
  static type = "italic";
}

export class CaptionSource extends Document {
  static contentType = "application/vnd.atjson+caption";
  static schema = [Bold, Italic];
}

export class Instagram extends ObjectAnnotation {
  static vendorPrefix = "test";
  static type = "instagram";
}

export class Paragraph extends BlockAnnotation {
  static vendorPrefix = "test";
  static type = "paragraph";
}

export class Code extends ObjectAnnotation<{
  class: string;
  language?: string;
  textStyle?: string;
  locale?: string;
}> {
  static vendorPrefix = "test";
  static type = "code";
}

export class Locale extends ObjectAnnotation<{
  locale: string;
}> {
  static vendorPrefix = "test";
  static type = "locale";
}

export class LineBreak extends ObjectAnnotation<{}> {
  static vendorPrefix = "test";
  static type = "line-break";
}

export class Preformatted extends ObjectAnnotation<{
  style: string;
}> {
  static vendorPrefix = "test";
  static type = "pre";
}

export class Image extends ObjectAnnotation<{
  caption: CaptionSource;
}> {
  static vendorPrefix = "test";
  static type = "image";
  static subdocuments = { caption: CaptionSource };
}

export class Quote extends ObjectAnnotation<{
  credit: string;
  citation: string;
}> {
  static vendorPrefix = "test";
  static type = "quote";
}

export class List extends BlockAnnotation<{
  type: "numbered" | "bulleted";
}> {
  static vendorPrefix = "test";
  static type = "list";
}

export class ListItem extends BlockAnnotation<{
  credit: string;
  citation: string;
}> {
  static vendorPrefix = "test";
  static type = "list-item";
}

export class Manual extends ObjectAnnotation {
  static vendorPrefix = "test";
  static type = "manual";
  handleChange(change: Change) {
    let insertion = change as Insertion;
    expect(change).toBeInstanceOf(Insertion);
    expect(this.start).toBe(0);
    expect(this.end).toBe(2);
    expect(insertion.start).toBe(2);
    expect(insertion.text).toBe("zzz");
    expect(insertion.behaviourLeading).toBe(EdgeBehaviour.preserve);
    expect(insertion.behaviourTrailing).toBe(EdgeBehaviour.modify);

    // artificial adjustment
    this.start = 1;
    this.end = 3;
  }
}

export default class TestSource extends Document {
  static contentType = "application/vnd.atjson+test";
  static schema = [
    Anchor,
    Bold,
    Code,
    Image,
    Instagram,
    Italic,
    Locale,
    LineBreak,
    List,
    ListItem,
    Manual,
    Paragraph,
    Preformatted,
    Quote,
  ];
}
