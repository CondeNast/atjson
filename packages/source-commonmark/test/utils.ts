import Renderer from '@atjson/renderer-hir';

class PlainTextRenderer extends Renderer {
  *root() {
    let text: string[] = yield;
    return text.join('');
  }
  *'-md-hardbreak'() {
    return '\n';
  }
  *'-md-bullet_list'({ tight }, state) {
    state.push({ tight });
    let text = yield;
    state.pop();
    return text;
  }
  *'-md-ordered_list'({ tight }, state) {
    state.push({ tight });
    let text = yield;
    state.pop();
    return text;
  }
  *'-md-paragraph'(_, state) {
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
