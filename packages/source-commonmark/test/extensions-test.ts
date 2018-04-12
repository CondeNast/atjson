import Document from '@atjson/document';
import Source, { schema } from '@atjson/source-commonmark';
import * as MarkdownIt from 'markdown-it';
import { render } from './utils';

class MarkdownItSource extends Source {
  static markdownParser() {
    return MarkdownIt();
  }
}

describe('strikethrough', () => {
  test('~hello~ is converted to strikethrough annotations', () => {
    let doc = new MarkdownItSource('~~hello~~');
    expect(render(doc)).toBe('hello\n\n');
    let strikethrough = doc.annotations.find(a => a.type === '-md-s');
    expect(strikethrough).toEqual({
      type: '-md-s',
      attributes: {},
      start: 1,
      end: 8
    });
  });
});
