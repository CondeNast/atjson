import Renderer from '@atjson/renderer';

export default class TextRenderer extends Renderer {
  *renderAnnotation(): IterableIterator<string> {
    let text: string[] = yield;
    return text.join('');
  }
}
