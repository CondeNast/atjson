import Renderer from "@atjson/renderer-hir";

export default class PlainTextRenderer extends Renderer {
  *root(): Iterator<void, string, string[]> {
    let text = yield;
    return text.join("");
  }
}
