import Document, { Annotation, JSON } from "@atjson/document";
import { Root } from "./annotations";
import HIRNode from "./hir-node";

function compareAnnotations(a: Annotation, b: Annotation) {
  if (a.start === b.start) {
    if (a.type === b.type) {
      return a.end - b.end;
    } else {
      return b.end - b.start - (a.end - a.start);
    }
  } else {
    return a.start - b.start;
  }
}

export default class HIR {
  rootNode: HIRNode;

  constructor(doc: Document) {
    let document: Document = doc.clone();

    for (let a of document.annotations) {
      if (a.start === a.end) {
        document.insertText(a.start, "\uFFFC");
        a.start = Math.max(0, a.start - 1);
      }
    }

    this.rootNode = new HIRNode(
      new Root({
        start: 0,
        end: document.content.length,
        attributes: {},
      })
    );

    for (let annotation of document.annotations.sort(compareAnnotations)) {
      this.rootNode.insertAnnotation(annotation);
    }

    this.rootNode.insertText(document.content);
  }

  toJSON(options?: { includeParseTokens: boolean }): JSON {
    return this.rootNode.toJSON(options);
  }
}
