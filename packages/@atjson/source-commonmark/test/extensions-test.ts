import * as MarkdownIt from 'markdown-it';
import CommonMarkSource from '../src';
import { render } from './utils';

class MarkdownItSource extends CommonMarkSource {
  markdownParser() {
    return MarkdownIt();
  }
}

describe('strikethrough', () => {
  test('~hello~ is converted to strikethrough annotations', () => {
    let doc = new MarkdownItSource('~~hello~~');
    expect(render(doc)).toBe('hello\n\n');
    let strikethrough = doc.annotations.find(a => a.type === 's');
    expect(strikethrough).toEqual({
      type: 's',
      attributes: {},
      start: 1,
      end: 8
    });
  });
});
