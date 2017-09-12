import HIR from 'atjson-hir';
import React from 'react';

function compile(annotations, node) {
  return React.createElement(
    annotations[node.type],
    node.data,
    ...node.children.map(function (childNode) {
      if (typeof childNode === 'string') {
        return childNode;
      } else {
        return compile(annotations, childNode);
      }
    })
  );
}

export default class {
  private env;
  constructor(env) {
    this.env = env;
  }

  render(hir) {
    return compile(this.env, hir.toJSON());
  }
};
