import { HIR } from '@atjson/hir';
import Document from '@atjson/document';
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
  static template = '<text-input><text-selection><div class="editor" style="white-space: pre-wrap" contenteditable></div></text-selection></text-input><hr><div class="output" style="white-space: pre-wrap"></div>';
  static events = {
    'change text-selection'(evt) {
      this.selection = evt.detail;
    },

    'insertText text-input'(evt) {
      this.document.insertText(evt.detail.position, evt.detail.text);
      this.selection.start += evt.detail.text.length;
      this.selection.end += evt.detail.text.length;
      this.scheduleRender();
    },

    'deleteText text-input'(evt) {
      let deletion = evt.detail;
      this.document.deleteText(deletion);
      // FIXME the selection should just be an annotation that we transform. We shouldn't handle logic here.
      if (this.selection.start < deletion.start) {
        // do nothing.
      } else if (this.selection.start < deletion.end) {
        this.selection.start = this.selection.end = deletion.start;
      } else {
        let l = deletion.end - deletion.start;
        this.selection.start -= l;
        this.selection.end -= l;
      }
      this.scheduleRender();
    },

    'addAnnotation text-input'(evt) {
      this.document.addAnnotations(evt.detail);
      this.scheduleRender();
    }

  };

  scheduleRender() {
    window.requestAnimationFrame(() => {
      this.render(this.querySelector('.editor'));
      this.render(this.querySelector('.output'));
    });
  }

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
    editor.hir = new Map<Element, HIRNode>();
    let annotationGraph = new HIR(this.document);

    let placeholder = document.createElement('div');
    let children = compile(this, editor.hir, annotationGraph.rootNode.children());
    children.forEach((element: Element) => {
      placeholder.appendChild(element);
    });

    // This can be improved by doing the comparison on an element-by-element
    // basis (or by rendering incrementally via the HIR), but for now this will
    // prevent flickering of OS UI elements (e.g., spell check) while typing
    // characters that don't result in changes outside of text elements.
    if (placeholder.innerHTML != editor.innerHTML) {
      console.log('not match', placeholder.innerHTML, '\n---\n', editor.innerHTML);
      editor.innerHTML = placeholder.innerHTML;

      // We need to do a force-reset here in order to avoid waiting for a full
      // cycle of the browser event loop. The DOM has changed, but if we wait
      // for the TextSelection MutationObserver to fire, the TextSelection
      // model will have an old set of nodes (since we've just replaced them
      // with new ones).
      //
      // PERF In the event of performance issues, this is a good candidate for
      // optimization.
      if (this.selection) {
        this.querySelector('text-selection').reset();
        this.querySelector('text-selection').setSelection(this.selection);
      }
    }
  }
}
