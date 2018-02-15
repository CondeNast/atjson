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

function flatten(array) {
  let flattenedArray = [];
  for (let i = 0, len = array.length; i < len; i++) {
    let item = array[i];
    if (Array.isArray(item)) {
      flattenedArray.push(...flatten(item));
    } else if (item != null) {
      flattenedArray.push(item);
    }
  }
  return flattenedArray;
}

function compile(renderer: Renderer, node: HIRNode, state: State, schema: Schema) {
  let generator = renderer.renderAnnotation(node, state, schema);
  let result = generator.next();
  if (result.done) {
    return result.value;
  }

  return generator.next(flatten(node.children().map((childNode: HIRNode) => {
    if (childNode.type === 'text' && typeof childNode.text === 'string') {
      return renderer.renderText(childNode.text, state);
    } else {
      return compile<T>(renderer, childNode, state, schema);
    }
  }))).value;
}

interface StateList {
  [key: string]: any;
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

export default class Renderer {
  *renderAnnotation(annotation: HIRNode, state: State, schema: Schema) {
    if (this[annotation.type]) {
      return yield* this[annotation.type](annotation.attributes, state, schema);
    }
    return yield;
  }

  renderText(text: string): string {
    return text;
  }

  render(document: Document): T {
    let annotationGraph;
    if (document instanceof Document) {
      annotationGraph = new HIR(document);
    } else {
      throw new Error('Supplied arguments invalid.');
    }

    let state = new State();
    let renderedDocument = compile<T>(this, annotationGraph.rootNode, state, document.schema);
    return renderedDocument;
  }
}
