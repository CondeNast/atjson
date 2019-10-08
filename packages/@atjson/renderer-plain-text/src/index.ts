import Renderer from "@atjson/renderer-hir";

export default class PlainTextRenderer extends Renderer {
  *root(): IterableIterator<any> {
    let text = yield;
    return text.join("");
  }

  *LineBreak() {
    yield; // Toss internal nodes
    return "\n";
  }

  *Paragraph() {
    let text = yield;
    return `${text.join("")}\n\n`;
  }
}
