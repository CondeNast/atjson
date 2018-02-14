import Document, { Schema } from '@atjson/document';
import { HIR, HIRNode } from '@atjson/hir';

const escape = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

export function escapeHTML(text: string): string {
  return text.replace(/[&<>"'`=]/g, (chr: keyof typeof escape) => escape[chr]);
}

function compile(renderer: Renderer, node: HIRNode, state: State, schema: Schema): any {
  let generator = renderer.renderAnnotation(node, state, schema);
  let result = generator.next();
  if (result.done) {
    return result.value;
  }

  return generator.next(node.children().map((childNode: HIRNode) => {
    if (childNode.type === 'text' && typeof childNode.text === 'string') {
      return renderer.renderText(childNode.text, state);
    } else {
      return compile(renderer, childNode, state, schema);
    }
  })).value;
}

interface StateList {
  [key: string]: value: any;
}

export class State {
  private _state: StateList[];

  constructor() {
    this._state = [];
  }

  push(list: StateList) {
    this._state.push(list);
  }

  pop() {
    this._state.pop();
  }

  get(key: string): any {
    let currentState: StateList | null = this._state[this._state.length - 1];
    if (currentState) {
      return currentState[key];
    }
    return null;
  }

  set(key: string, value: any) {
    let currentState: StateList | null = this._state[this._state.length - 1];
    if (currentState) {
      currentState[key] = value;
    } else {
      this.push({ [key]: value });
    }
  }
}

export default abstract class Renderer {
  abstract renderAnnotation(node: HIRNode, state: State, schema: Schema): IterableIterator<any>;

  renderText(text: string): string {
    return text;
  },

  render(document: Document): any {
    let annotationGraph;
    if (document instanceof Document) {
      annotationGraph = new HIR(document);
    } else {
      throw new Error('Supplied arguments invalid.');
    }

    let state = new State();
    let renderedDocument = compile(this, annotationGraph.rootNode, state, document.schema);
    return renderedDocument;
  }
}
