import { HIR } from '@atjson/hir';

export default class WebComponentRenderer {

  constructor(document) {
    this.document = document;
  }

  text({ text }) {
    if (text[text.length - 1] == "\n") {
      var nonBreakStrings = text.split("\n");
      console.log('+++--->' + text + '<---+++', '->',nonBreakStrings);
      if (nonBreakStrings[nonBreakStrings.length - 1] == '') {
        nonBreakStrings.pop();
      }
      var children = nonBreakStrings.map((str: string) => {
        var span = document.createElement('span');
        span.style.whiteSpace = 'normal';
        span.style.display = 'none';
        span.contentEditable = false;
        span.appendChild(document.createTextNode("\n"));
        console.log(span);
        return [document.createTextNode(str), span]
      }).reduce((a, b) => a.concat(b));

      console.log(children);

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

  italic() {
    return document.createElement('em');
  }

  underline() {
    return document.createElement('u');
  }

  link(attributes) {
    let link = document.createElement('a');
    link.setAttribute('href', attributes.uri);
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
        let element = this[node.type](node);
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
