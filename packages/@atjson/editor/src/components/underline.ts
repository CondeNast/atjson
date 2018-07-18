export default class OffsetUnderlineElement {

  static annotationName = 'underline';

  static elementRenderer = (node: any): Element => {
    return document.createElement('u');
  }
}
