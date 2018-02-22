import Document, { Annotation } from '@atjson/document';
import HIRNode from './hir-node';
import JSONNode from './json-node';

export default class HIR {

  atjson: AtJSON;
  rootNode: HIRNode;

  constructor(document: Document) {
    this.document = new Document({
      content: document.content,
      contentType: document.contentType,
      annotations: [...document.annotations],
      schema: document.schema
    });

    this.populateHIR();
  }

  toJSON(): JSONNode | string {
    return this.rootNode.toJSON();
  }

  populateHIR(): void {

    let document = this.document;
    document.annotations
      .filter(a => a.start === a.end)
      .forEach(a => {
         document.insertText(a.start, "\uFFFC");
         a.start--;
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
    }).forEach(annotation => this.rootNode.insertAnnotation(annotation));

    this.rootNode.insertText(document.content);
  }
}
