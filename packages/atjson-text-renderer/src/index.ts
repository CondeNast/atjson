import Renderer from 'atjson-renderer';

export default class TextRenderer extends Renderer {
  *renderAnnotation() {
    let text = yield;
    return text.join('');
  }
}
