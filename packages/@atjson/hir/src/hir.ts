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
  slices: Record<string, Document>;
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

    this.slices = {};
    let sliceRanges: { start: number; end: number }[] = [];
    let sliceAnnotations = this.document.where((a) => is(a, SliceAnnotation));
    for (let annotation of sliceAnnotations) {
      this.slices[annotation.id] = this.document.slice(
        annotation.start,
        annotation.end,
        (a) =>
          a.start >= annotation.start &&
          a.end <= annotation.end &&
          a.id !== annotation.id
      );

      // Only remove slices that aren't retained
      if (!annotation.attributes.retain) {
        this.document
          .where(
            (a) =>
              (a.start >= annotation.start && a.end <= annotation.end) ||
              a.id === annotation.id
          )
          .remove();
        sliceRanges.push({ start: annotation.start, end: annotation.end });
      }
    }
    this.document.deleteTextRanges(sliceRanges);

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
