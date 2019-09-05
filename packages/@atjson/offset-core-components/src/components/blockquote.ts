export default class OffsetBlockquoteElement {
  static annotationName = "blockquote";

  static elementRenderer(): Element {
    return document.createElement("blockquote");
  }
}
