export default class OffsetBlockquoteElement {

  static annotationName = 'blockquote';

  static elementRenderer = (node: any): Element => {
    return document.createElement('blockquote');
  }
}
