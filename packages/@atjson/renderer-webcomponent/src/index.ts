import Document from "@atjson/document";
import { HIR, HIRNode } from "@atjson/hir";

interface WebComponentRenderer {
  [key: string]: any;
}

class WebComponentRenderer {
  document: Document;

  constructor(document: Document) {
    this.document = document;
  }

  text({ text }: { text: string }) {
    if (text[text.length - 1] === "\n") {
      let nonBreakStrings = text.split("\n");
      if (nonBreakStrings[nonBreakStrings.length - 1] === "") {
        nonBreakStrings.pop();
      }

      let children = [];
      for (let str of nonBreakStrings) {
        let span = document.createElement("span");
        span.style.whiteSpace = "normal";
        span.style.display = "none";
        span.contentEditable = "false";
        span.appendChild(document.createTextNode("\n"));
        children.push(document.createTextNode(str), span);
      }

      let textParentNode = document.createElement("span");
      for (let child of children) {
        textParentNode.appendChild(child);
      }

      return textParentNode;
    }
    return document.createTextNode(text);
  }

  render() {
    let hir = new Map<Element, HIRNode>();
    let annotationGraph = new HIR(this.document);

    let placeholder = document.createElement("div");
    let children = this.compile(hir, annotationGraph.rootNode.children());
    for (let element of children) {
      placeholder.appendChild(element);
    }
    return placeholder;
  }

  compile(hir: Map<Element, HIRNode>, nodes: HIRNode[]): Element[] {
    let compileNode = (node: HIRNode) => {
      let children = node.children();
      if (children.length > 0) {
        let element: Element;
        if (typeof (this as any)[node.type] === "function") {
          element = this[node.type](node);
        } else {
          element = document.createElement("span");
          element.classList.add("unknown-annotation");
        }

        if (node.id) {
          element.setAttribute("data-annotation-id", node.id.toString());
        }

        hir.set(element, node);
        for (let child of this.compile(hir, children)) {
          element.appendChild(child);
        }
        return element;
      } else {
        let text;
        if (typeof (this as any)[node.type] === "function") {
          text = this[node.type](node);
        } else {
          text = "";
        }
        hir.set(text, node);
        return text;
      }
    };
    return nodes.map(compileNode);
  }
}

export default WebComponentRenderer;
