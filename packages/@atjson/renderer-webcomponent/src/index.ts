import Document, { Annotation } from '@atjson/document';
import { HIR, HIRNode } from '@atjson/hir';

interface WebComponentRenderer {
  [key: string]: any;
}

class WebComponentRenderer {

  document: Document;

  constructor(document: Document) {
    this.document = document;
  }

  text({ text }: { text: string }) {
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
      }).reduce((a: Array<Text | HTMLSpanElement>, b: Array<Text | HTMLSpanElement>): Array<Text | HTMLSpanElement> => a.concat(b));

      let textParentNode = document.createElement('span');
      children.forEach((child: Node) => {
        textParentNode.appendChild(child);
      });

      return textParentNode;
    }
    return document.createTextNode(text);
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
        let annotation = node.annotation;
        let AnnotationClass = annotation.constructor as typeof Annotation;
        let elementName = `${AnnotationClass.vendorPrefix}-${annotation.type}`;
        let hasCustomElement = !!window.customElements.get(elementName);
        if (hasCustomElement) {
          element = document.createElement(elementName);
          Object.keys(annotation.attributes).forEach(key => {
            let attributes = annotation.attributes as any;
            element.setAttribute(key, attributes[key]);
            (element as any)[key] = attributes[key];
          });
        } else {
          element = document.createElement('span');
          element.classList.add('unknown-annotation');
        }

        if (node.id) {
          element.setAttribute('data-annotation-id', node.id.toString());
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

export default WebComponentRenderer;
