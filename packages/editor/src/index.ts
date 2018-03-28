import { HIR } from '@atjson/hir';
import events from './mixins/events';
import './text-selection';
import './text-input';

const TEXT_NODE_TYPE = 3;

type Element = TextNode | HTMLElement;

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

export default class Editor extends events(HTMLElement) {
  static template = '<text-input><text-selection><div class="editor" contenteditable></div></text-selection></text-input><hr><div class="output"></div>';
  static events = {
    'change text-selection'(evt) {
      this.selection = evt.detail;
    }
  };

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
    this.innerHTML = this.constructor.template;
    super.connectedCallback();
    this.render(this.querySelector('.editor'));
    this.render(this.querySelector('.output'));
  }
}
