export default class OffsetItalicElement {
  static annotationName = "italic";

  static elementRenderer(): Element {
    return document.createElement("em");
  }
}
