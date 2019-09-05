import "./heading-action-button";

export default class OffsetHeadingElement {
  static annotationName = "heading";

  static elementRenderer(node: any): Element {
    return document.createElement("h" + node.attributes.level);
  }

  static get selectionButton() {
    return document.createElement("offset-heading-action-button");
  }
}
