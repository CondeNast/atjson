export default class OffsetItalicElement {

  static annotationName = 'italic';

  static elementRenderer = (node: any): Element => {
    return document.createElement('em');
  }
}
