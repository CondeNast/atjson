import { AtJSON } from '@atjson/core';
import { HIR, HIRNode } from '@atjson/hir';

function compile(scope: Renderer, node: HIRNode): any {
  let generator = scope.invoke(scope.renderAnnotation, node);
  let result = generator.next();
  if (result.done) {
    return result.value;
  }

  return generator.next(node.children().map(function (childNode) {
    if (childNode.type === 'text' && typeof childNode.text === 'string') {
      return childNode.text;
    } else {
      return compile(scope, childNode);
    }
  })).value;
}

export default abstract class Renderer {
  private scopes: Object[];

  constructor() {
    this.scopes = [];
  }

  pushScope(scope: any): void {
    this.scopes.push(Object.assign({
      popScope: () => this.popScope(),
      pushScope: (scope: any) => this.pushScope(scope)
    }, scope));
  }

  popScope(): void {
    this.scopes.pop();
  }

  invoke(fn: (node: HIRNode) => IterableIterator<string>, ...args: any[]) {
    let scope = this.scopes[this.scopes.length - 1];
    return fn.call(scope, ...args);
  }

  abstract renderAnnotation(node: HIRNode): IterableIterator<any>;

  willRender(): void {
    this.pushScope({});
  }

  didRender(): void {
    this.popScope();
  }

  render(atjson: AtJSON|HIR): string {

    let annotationGraph;
    if (atjson instanceof AtJSON) {
      annotationGraph = new HIR(atjson);
    } else if (atjson instanceof HIR) {
      annotationGraph = atjson;
    } else {
      throw new Error('Supplied arguments invalid.');
    }

    this.willRender();
    let renderedDocument = compile(this, annotationGraph.rootNode);
    this.didRender();
    return renderedDocument;
  }
}
