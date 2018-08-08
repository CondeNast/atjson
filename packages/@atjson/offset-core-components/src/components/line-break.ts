export default class OffsetLineBreakElement {

  static annotationName = 'line-break';

  static elementRenderer = (node: any): Element => {
    let parentElement = document.createElement('span');
    parentElement.appendChild(document.createElement('br'));

    return parentElement;
  }
}
