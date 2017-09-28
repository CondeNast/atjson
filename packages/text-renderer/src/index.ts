import Renderer from '@atjson/renderer';

export default class TextRenderer extends Renderer {
  *renderAnnotation() {
    let text: string[] = yield;
    return text.join('');
  }
}
