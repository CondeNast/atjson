import { HIR } from 'atjson-hir';

class Scope {
  private scopes: Object[];

  constructor() {
    this.scopes = [];
  }

  pushScope(scope) {
    this.scopes.push(scope);
  }

  popScope() {
    this.scopes.pop();
  }

  invoke(fn, ...args) {
    return fn.call(this.scopes[this.scopes.length - 1], ...args);
  }
}

function compile(env, node, scope): string {
  let generator = scope.invoke(env[node.type], node.data);
  let result = generator.next();
  if (result.done) {
    return result.value;
  }

  return generator.next(node.children.map(function (childNode) {
    if (typeof childNode === 'string') {
      return childNode;
    } else {
      return compile(env, childNode, scope);
    }
  }).join('')).value;
}

export default class {
  private env;
  constructor(env) {
    this.env = env;
  }

  render(hir: HIR): string {
    let scope = new Scope();
    scope.pushScope({});
    let text = compile(this.env, hir.toJSON(), scope);
    scope.popScope();
    return text;
  }
}
