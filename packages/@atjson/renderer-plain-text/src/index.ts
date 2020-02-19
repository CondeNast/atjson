import Document, { Annotation } from "@atjson/document";
import Renderer from "@atjson/renderer-hir";

export default class PlainTextRenderer extends Renderer {
  constructor(document: Document, ...args: any[]) {
    document
      .where((annotation: Annotation) => annotation.type !== "parse-token")
      .remove();
    super(document, args);
  }

  *root() {
    let text = yield;
    return text.join("");
  }
}
