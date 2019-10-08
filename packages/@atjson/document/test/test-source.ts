import Document, {
  AdjacentBoundaryBehaviour,
  Change,
  InlineAnnotation,
  Insertion,
  ObjectAnnotation
} from "../src";

export class Anchor extends InlineAnnotation<{
  href: string;
  target?: string | null;
}> {
  static vendorPrefix = "test";
  static type = "a";
}

export class Bold extends InlineAnnotation {
  static vendorPrefix = "test";
  static type = "bold";
}

export class Italic extends InlineAnnotation {
  static vendorPrefix = "test";
  static type = "italic";
}

export const CaptionSchema = {
  type: "application/vnd.atjson+caption",
  version: "n/a",
  annotations: { Bold, Italic }
} as const;

export class Instagram extends ObjectAnnotation {
  static vendorPrefix = "test";
  static type = "instagram";
}

export class Paragraph extends ObjectAnnotation {
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

export class Preformatted extends ObjectAnnotation<{
  style: string;
}> {
  static vendorPrefix = "test";
  static type = "pre";
}

export class Image extends ObjectAnnotation<{
  url: string;
  caption: Document<typeof CaptionSchema>;
}> {
  static vendorPrefix = "test";
  static type = "image";
  static subdocuments = { caption: CaptionSchema };
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
    expect(insertion.behaviour).toBe(AdjacentBoundaryBehaviour.default);

    // artificial adjustment
    this.start = 1;
    this.end = 3;
  }
}

const TestSchema = {
  type: "application/vnd.atjson+test",
  version: "n/a",
  annotations: {
    Anchor,
    Bold,
    Code,
    Image,
    Instagram,
    Italic,
    Locale,
    Manual,
    Paragraph,
    Preformatted
  }
};

export default TestSchema;
