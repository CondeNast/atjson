export default class OffsetParagraphElement {
  static annotationName = "paragraph";

  static elementRenderer(): Element {
    return document.createElement("p");
  }
}
