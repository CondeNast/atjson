import Renderer from '@atjson/renderer-hir';

class PlainTextRenderer extends Renderer {
  *root() {
    let text: string[] = yield;
    return text.join('');
  }
  *hardbreak() {
    return '\n';
  }
  *bullet_list({ tight }, state) {
    state.push({ tight });
    let text = yield;
    state.pop();
    return text;
  }
  *ordered_list({ tight }, state) {
    state.push({ tight });
    let text = yield;
    state.pop();
    return text;
  }
  *paragraph(_, state) {
    let text = yield;
    if (state.get('tight')) {
      return `${text.join('')}\n`;
    }
    return `${text.join('')}\n\n`;
  }
}

export function render(doc) {
  let renderer = new PlainTextRenderer();
  return renderer.render(doc);
}
