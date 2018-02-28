import { HIR } from '@atjson/hir';

const TEXT_NODE_TYPE = 3;

type Element = TextNode | HTMLElement;

interface ListenerLookup {
  [key: string]: any;
}

function getNodeAndOffset(node: Element | null, offset: number): { node: Element | null, offset: number } | never {
  if (node == null) {
    return { node: null, offset };
  } else if (node.nodeType === TEXT_NODE_TYPE) {
    return { node, offset };
  } else if (node.childNodes.length > 0) {
    let offsetNode = node.childNodes[offset];

    // If the offset node has a single child node,
    // use that node instead of the parent
    if (offsetNode.nodeType !== TEXT_NODE_TYPE &&
        offsetNode.childNodes.length === 1) {
      offsetNode = offsetNode.childNodes[0];
    }

    // The offset node is a text node; quickly return
    if (offsetNode.nodeType === TEXT_NODE_TYPE) {
      return { node: offsetNode, offset: 0 };

    // Find the closest text node and return that
    } else if (!offsetNode.hasChildNodes()) {
      let adjustedOffset = offset - 1;

      // Look for the nearest preceding text node
      while (offsetNode.nodeType !== TEXT_NODE_TYPE &&
             adjustedOffset > 0) {
        offsetNode = node.childNodes[adjustedOffset--];
      }

      if (offsetNode.nodeType === TEXT_NODE_TYPE) {
        offset = offsetNode.length;

      // Look for the next text node following the offset
      } else {
        adjustedOffset = offset;
        offset = 0;
        while (offsetNode.nodeType !== TEXT_NODE_TYPE &&
               adjustedOffset < node.childNodes.length) {
          offsetNode = node.childNodes[adjustedOffset++];
        }
      }

      if (offsetNode.nodeType !== TEXT_NODE_TYPE) {
        throw new Error("A node / offset pair couldn't be found for the selection.");
      } else {
        return { node: offsetNode, offset };
      }
    } else {
      throw new Error("The selection for this node is ambiguous- we received a node with child nodes, but expected to get a leaf node");
    }
  } else {
    return { node: null, offset };
  }
}

function compile(editor: Editor, hir: Map<Element, HIRNode>, nodes: HIRNode[]): Element[] {
  return nodes.map((node: HIRNode) => {
    let children = node.children();
    if (children.length > 0) {
      let element = editor[node.type](node);
      hir.set(element, node);
      compile(editor, hir, children).forEach((child: Element) => {
        element.appendChild(child);
      });
      return element;
    }
    let text = editor[node.type](node);
    hir.set(text, node);
    return text;
  });
}

export default class Editor extends HTMLElement {
  text({ text }) {
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

  'line-break'() {
    return document.createElement('br');
  }

  beforeinput(evt) {
    let ranges = evt.getTargetRanges();
    let editor = this.querySelector('.editor');

    let base = getNodeAndOffset(ranges[0].startContainer, ranges[0].startOffset);
    let extent = getNodeAndOffset(ranges[0].endContainer, ranges[0].endOffset);
    let start = editor.hir.get(base.node).start + base.offset;
    let end = editor.hir.get(extent.node).end + extent.offset;

    switch (evt.inputType) {
    case 'insertText':
      this.document.insertText(start, evt.data);
      break;
    case 'insertLineBreak':
      this.document.insertText(start, '\u2028', true);
      this.document.addAnnotations({
        type: 'line-break',
        start: start,
        end: end + 1
      });
      break;
    case 'formatBold':
      this.document.addAnnotations({
        type: 'bold',
        start,
        end
      });
    case 'insertParagraph':
      this.document.insertText(start, '\n', true);
      this.document.addAnnotations({
        type: 'paragraph',
        start: end + 1,
        end: end + 1
      });
      break;
    case 'deleteContentBackward':
    case 'deleteContentForward':
      this.document.deleteText({ start, end });
      break;
    }

    this.render(this.querySelector('.output'));
  }

  listeners: ListenerLookup;

  render(editor) {
    editor.innerHTML = '';
    editor.hir = new Map<Element, HIRNode>();
    let annotationGraph = new HIR(this.document);
    let children = compile(this, editor.hir, annotationGraph.rootNode.children());
    children.forEach((element: Element) => {
      editor.appendChild(element);
    });
  }

  connectedCallback() {
    this.listeners = {};
    this.listeners.beforeinput = (evt) => this.beforeinput(evt);
    this.addEventListener('beforeinput', this.listeners.beforeinput);

    this.innerHTML = '<div class="editor" contenteditable="true"></div><div class="output"></div>';
    this.render(this.querySelector('.editor'));
    this.render(this.querySelector('.output'));
  }

  disconnectedCallback() {
    Object.keys(this.listeners).forEach((eventName) => {
      this.removeEventListener(eventName, this.listeners[eventName]);
    });
    this.listeners = {};
  }
}
