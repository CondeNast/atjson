import HIR from 'atjson';
import React from 'react';
import markdown from './markdown';

function compile(annotations, node) {
  return React.createElement(
    annotations[node.type],
    null,
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
  private hir: HIR;
  constructor (hir) {
    this.hir = hir;
  }

  compile () {
    return compile(markdown, this.hir.toJSON());
  }
};
