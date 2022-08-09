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

  constructor(doc: Document) {
    let document: Document = doc.clone();

    // Do some basic document normalization here,
    // expanding any zero-width annotations
    for (let a of document.annotations) {
      if (a.start === a.end) {
        document.insertText(a.start, "\uFFFC");
        a.start = Math.max(0, a.start - 1);
      }
    }

    let slices: Record<string, Document> = {};
    let sliceRanges: { start: number; end: number }[] = [];
    let sliceAnnotations = document.where((a) => is(a, SliceAnnotation));
    for (let annotation of sliceAnnotations) {
      let slice = document.clone();
      slice
        .where(
          (a) =>
            !(a.start >= annotation.start && a.end <= annotation.end) ||
            a.id === annotation.id
        )
        .remove();
      slices[annotation.id] = slice.slice(annotation.start, annotation.end);

      document
        .where(
          (a) =>
            (a.start >= annotation.start && a.end <= annotation.end) ||
            a.id === annotation.id
        )
        .remove();
      sliceRanges.push({ start: annotation.start, end: annotation.end });
    }
    document.deleteTextRanges(sliceRanges);

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
