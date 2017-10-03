import Renderer from '@atjson/text-renderer';

export default class PlainTextRenderer extends Renderer {
  *renderAnnotation(): IterableIterator<string> {
    let text: string[] = yield;
    return text.join('');
  }
}
