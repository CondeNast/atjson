import Renderer, { escapeHTML } from '@atjson/renderer-hir';

export default class WebComponentRenderer extends Renderer {

  renderText(text: string) {
    return escapeHTML(text);
  }
  
  *renderAnnotation(node): IterableIterator<string> {
    let text = yield;
    let attributes = node.attributes;
    let attrs = '';
    if (attributes) {
      // FIXME this is both buggy and incorrect, since many annotation
      // attributes are not necessarily appropriate for inclusion in HTML.
      attrs = Object.keys(attributes).map(key => `${key}='${attributes[key]}'`).join(' ');
    }
    return `<${node.type} ${attrs}>${text.join('')}</${node.type}>`;
  }
}
