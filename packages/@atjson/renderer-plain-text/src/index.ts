import Document from "@atjson/document";
import Annotation from "@atjson/annotation";
import Renderer from "@atjson/renderer-hir";

export default class PlainTextRenderer extends Renderer {
  constructor(_document: Document,  ..._args: any[]) {
    _document.where((annotation: Annotation) => annotation.type !== 'parse-token')
             .remove();
    super(_document, _args);
  }

  *root(): Iterator<void, string, string[]> {
    let text = yield;
    return text.join("");
  }
}
