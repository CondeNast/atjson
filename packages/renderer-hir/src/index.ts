import { AtJSON } from '@atjson/core';
import { HIR, HIRNode } from '@atjson/hir';

function compile(renderer: Renderer, node: HIRNode, state: State): any {
  let generator = renderer.renderAnnotation(node, state);
  let result = generator.next();
  if (result.done) {
    return result.value;
  }

  return generator.next(node.children().map((childNode: HIRNode) => {
    if (childNode.type === 'text' && typeof childNode.text === 'string') {
      return childNode.text;
    } else {
      return compile(renderer, childNode, state);
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
  abstract renderAnnotation(node: HIRNode, state: State): IterableIterator<any>;

  render(atjson: AtJSON | HIR): any {
    let annotationGraph;
    if (atjson instanceof AtJSON) {
      annotationGraph = new HIR(atjson);
    } else if (atjson instanceof HIR) {
      annotationGraph = atjson;
    } else {
      throw new Error('Supplied arguments invalid.');
    }

    let state = new State();
    let renderedDocument = compile(this, annotationGraph.rootNode, state);
    return renderedDocument;
  }
}
