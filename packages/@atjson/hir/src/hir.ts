import Document, { Annotation, JSON } from '@atjson/document';
import { v4 as uuid } from 'uuid';
import { Root } from './annotations';
import HIRNode from './hir-node';

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
      id: uuid(),
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

    this.rootNode.insertText(document.content);
  }

  toJSON(): JSON {
    return this.rootNode.toJSON();
  }
}
