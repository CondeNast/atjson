import Renderer from '@atjson/renderer-hir';

export default class PlainTextRenderer extends Renderer {
  *Root(): IterableIterator<any> {
    let text = yield;
    return text.join('');
  }
}
