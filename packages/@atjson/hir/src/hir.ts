import Document, { Annotation, JSON } from '@atjson/document';
import { Root } from './annotations';
import HIRNode from './hir-node';
const { performance } = require('perf_hooks');

function measure(name: string, fn: () => any) {
  performance.mark(`⏱ ${name}`);
  let result = fn();
  performance.mark(`🏁 ${name}`);
  performance.measure(name, `⏱ ${name}`, `🏁 ${name}`);
  performance.clearMarks(`⏱ ${name}`);
  performance.clearMarks(`🏁 ${name}`);
  return result;
}

export default class HIR {

  rootNode: HIRNode;

  constructor(doc: Document) {
    let document: Document = doc.clone();

    document.annotations
      .filter(a => a.start === a.end)
      .forEach(a => {
         document.insertText(a.start, '\uFFFC');
         a.start = Math.max(0, a.start - 1);
      });

    this.rootNode = new HIRNode(new Root({
      start: 0,
      end: document.content.length,
      attributes: {}
    }));

    document.annotations.sort((a: Annotation, b: Annotation) => {
      if (a.start === b.start) {
        if (a.type === b.type) {
          return a.end - b.end;
        } else {
          return (b.end - b.start) - (a.end - a.start);
        }
      } else {
        return a.start - b.start;
      }
    }).forEach((annotation: Annotation) => this.rootNode.insertAnnotation(annotation));

    measure('insertText', () => this.rootNode.insertText(document.content));
  }

  toJSON(): JSON {
    return this.rootNode.toJSON();
  }
}
