export default class OffsetStrikethroughElement {
  static annotationName = "strikethrough";

  static elementRenderer(): Element {
    return document.createElement("del");
  }
}
