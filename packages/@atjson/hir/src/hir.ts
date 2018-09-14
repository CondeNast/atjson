import Document, { Annotation } from '@atjson/document';
import HIRNode from './hir-node';
import JSONNode from './json-node';

export default class HIR {

  document: Document;
  rootNode: HIRNode;

  constructor(doc: Document) {
    let document = this.document = new Document({
      content: doc.content,
      contentType: doc.contentType,
      annotations: [...doc.annotations],
      schema: doc.schema
    });

    document.annotations
      .filter(a => a.start === a.end)
      .forEach(a => {
         document.insertText(a.start, '\uFFFC');
         a.start = Math.max(0, a.start - 1);
      });
    document.where({ type: 'parse-element' }).remove();

    this.rootNode = new HIRNode({
      type: 'root',
      start: 0,
      end: document.content.length
    }, document.schema);

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

  toJSON(): JSONNode | string {
    return this.rootNode.toJSON();
  }
}
