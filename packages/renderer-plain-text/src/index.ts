import Renderer from '@atjson/renderer-text';

export default class PlainTextRenderer extends Renderer {
  *renderAnnotation(): IterableIterator<string> {
    let text: string[] = yield;
    return text.join('');
  }
}
