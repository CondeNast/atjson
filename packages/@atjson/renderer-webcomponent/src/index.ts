import Document from '@atjson/document';
import { HIR, HIRNode } from '@atjson/hir';

export default class WebComponentRenderer {

  document: Document;

  constructor(document: Document) {
    this.document = document;
  }

  text({ text }) {
    if (text[text.length - 1] === '\n') {
      let nonBreakStrings = text.split('\n');
      if (nonBreakStrings[nonBreakStrings.length - 1] === '') {
        nonBreakStrings.pop();
      }
      let children = nonBreakStrings.map((str: string) => {
        let span = document.createElement('span');
        span.style.whiteSpace = 'normal';
        span.style.display = 'none';
        span.contentEditable = 'false';
        span.appendChild(document.createTextNode('\n'));
        return [document.createTextNode(str), span];
      }).reduce((a, b) => a.concat(b));

      let textParentNode = document.createElement('span');
      children.forEach((child: Node) => {
        textParentNode.appendChild(child);
      });

      return textParentNode;
    }
    return document.createTextNode(text);
  }

  paragraph() {
    return document.createElement('p');
  }

  bold() {
    return document.createElement('strong');
  }

  strikethrough() {
    return document.createElement('del');
  }

  italic() {
    return document.createElement('em');
  }

  underline() {
    return document.createElement('u');
  }

  'line-break'() {
    let parentElement = document.createElement('span');
    parentElement.appendChild(document.createElement('br'));

    return parentElement;
  }

  render() {
    let hir = new Map<Element, HIRNode>();
    let annotationGraph = new HIR(this.document);

    let placeholder = document.createElement('div');
    let children = this.compile(hir, annotationGraph.rootNode.children());
    children.forEach((element: Element) => {
      placeholder.appendChild(element);
    });
    return placeholder;
  }

  compile(hir: Map<Element, HIRNode>, nodes: HIRNode[]): Element[] {
    return nodes.map((node: HIRNode) => {
      let children = node.children();
      if (children.length > 0) {
        let element: Element;
        if (typeof (this as any)[node.type] === 'function') {
          element = this[node.type](node);
          if (node.id) {
            element.setAttribute('data-annotation-id', node.id.toString());
          }
        } else {
          element = document.createElement('span');
        }
        hir.set(element, node);
        this.compile(hir, children).forEach((child: Element) => {
          element.appendChild(child);
        });
        return element;
      } else {
        let text;
        if (typeof (this as any)[node.type] === 'function') {
          text = this[node.type](node);
        } else {
          text = '';
        }
        hir.set(text, node);
        return text;
      }
    });
  }
}
