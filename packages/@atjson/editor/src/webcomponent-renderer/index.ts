import { HIR } from '@atjson/hir';
import EditableLink from './components/editable-link';

if (!window.customElements.get('editable-link')) {
  window.customElements.define('editable-link', EditableLink);
}

export default class WebComponentRenderer {

  constructor(document) {
    this.document = document;
  }

  text({ text }) {
    if (text[text.length - 1] == "\n") {
      var nonBreakStrings = text.split("\n");
      if (nonBreakStrings[nonBreakStrings.length - 1] == '') {
        nonBreakStrings.pop();
      }
      var children = nonBreakStrings.map((str: string) => {
        var span = document.createElement('span');
        span.style.whiteSpace = 'normal';
        span.style.display = 'none';
        span.contentEditable = false;
        span.appendChild(document.createTextNode("\n"));
        return [document.createTextNode(str), span]
      }).reduce((a, b) => a.concat(b));

      var textParentNode = document.createElement('span');
      children.forEach((child) => {
        textParentNode.appendChild(child);
      })

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

  link(node) {
    let link = document.createElement('editable-link');
    link.setAttribute('url', node.attributes.url);
    if (node.attributes.nofollow) {
      link.setAttribute('nofollow', '');
    }
    return link;
  }

  'line-break'() {
    var parentElement = document.createElement('span');
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
        let element = document.createElement('span');
        if (this[node.type]) {
          element = this[node.type](node);
          element.setAttribute('data-annotation-id', node.id);
        }
        hir.set(element, node);
        this.compile(hir, children).forEach((child: Element) => {
          element.appendChild(child);
        });
        return element;
      }
      let text = this[node.type](node);
      hir.set(text, node);
      return text;
    });
  }
}
