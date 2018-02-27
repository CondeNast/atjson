import Renderer from '@atjson/renderer-hir';

export default class PlainTextRenderer extends Renderer {
  *root(): IterableIterator<string> {
    let text: string[] = yield;
    return text.join('');
  }
}
