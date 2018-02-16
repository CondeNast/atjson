import Document from '@atjson/document';
import { HIR } from '@atjson/hir';
import Renderer from '@atjson/renderer-hir';
import CommonMarkSource, { schema } from '@atjson/source-commonmark';

export default class PlainTextRenderer extends Renderer {
  *root() {
    let text: string[] = yield;
    return text.join('');
  }
  *hardbreak() {
    return '\n';
  }
  *paragraph() {
    let text = yield;
    return `${text.join('')}\n\n`;
  }
}

function render(doc) {
  let renderer = new PlainTextRenderer();
  return renderer.render(doc);
}

describe('whitespace', () => {
  test('&nbsp; is translated to a non-breaking space', () => {
    let doc = new CommonMarkSource('&nbsp;');
    expect(render(doc)).toBe('\u00A0\n\n');
  });

  test('  \\n is converted to a hardbreak', () => {
    let doc = new CommonMarkSource('1  \n2');
    expect(render(doc)).toBe('1\n2\n\n');
  });
});

describe('code blocks', () => {
  test('` `` ` is converted to an inline code block', () => {
    let doc = new CommonMarkSource('` `` `');
    expect(render(doc)).toBe(' `` \n\n');
  });
});

describe('list', () => {
  test('nested lists', () => {
    let doc = new CommonMarkSource('- 1\n  - 2\n    - 3');
    expect(render(doc)).toBe('1\n2\n3\n');
  });
});
