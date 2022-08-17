import Document, {
  Annotation,
  JSON,
  SliceAnnotation,
  is,
} from "@atjson/document";
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
  sliceNodes: Record<string, HIRNode>;
  document: Document;

  constructor(doc: Document) {
    this.document = doc.clone();

    // Do some basic document normalization here,
    // expanding any zero-width annotations
    for (let a of this.document.annotations) {
      if (a.start === a.end) {
        this.document.insertText(a.start, "\uFFFC");
        a.start = Math.max(0, a.start - 1);
      }
    }

    let slices: Record<string, Document> = {};
    let sliceRanges: { start: number; end: number }[] = [];
    let sliceAnnotations = this.document.where((a) => is(a, SliceAnnotation));
    for (let annotation of sliceAnnotations) {
      slices[annotation.id] = this.document.slice(
        annotation.start,
        annotation.end,
        (a) =>
          a.start >= annotation.start &&
          a.end <= annotation.end &&
          a.id !== annotation.id
      );

      this.document
        .where(
          (a) =>
            (a.start >= annotation.start && a.end <= annotation.end) ||
            a.id === annotation.id
        )
        .remove();
      sliceRanges.push({ start: annotation.start, end: annotation.end });
    }
    this.document.deleteTextRanges(sliceRanges);

    this.sliceNodes = {};
    for (let id in slices) {
      let slice = slices[id];
      let sliceNode = new HIRNode(
        new Root({
          start: 0,
          end: slice.content.length,
          attributes: {},
        })
      );

      for (let annotation of slice.annotations.sort(compareAnnotations)) {
        sliceNode.insertAnnotation(annotation);
      }

      sliceNode.insertText(slice.content);
      this.sliceNodes[id] = sliceNode;
    }

    this.rootNode = new HIRNode(
      new Root({
        start: 0,
        end: this.document.content.length,
        attributes: {},
      })
    );

    for (let annotation of this.document.annotations.sort(compareAnnotations)) {
      this.rootNode.insertAnnotation(annotation);
    }

    this.rootNode.insertText(this.document.content);
  }

  toJSON(options?: { includeParseTokens: boolean }): JSON {
    return this.rootNode.toJSON(options);
  }
}
