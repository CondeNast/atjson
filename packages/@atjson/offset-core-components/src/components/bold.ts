export default class OffsetBoldElement {
  static annotationName = "bold";

  static elementRenderer(): Element {
    return document.createElement("strong");
  }
}
