export default class OffsetUnderlineElement {

  static annotationName = 'underline';

  static elementRenderer(): Element {
    return document.createElement('u');
  }
}
