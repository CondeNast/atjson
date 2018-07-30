export default class OffsetBoldElement {

  static annotationName = 'bold';

  static elementRenderer = (node: any): Element => {
    return document.createElement('strong');
  }
}
