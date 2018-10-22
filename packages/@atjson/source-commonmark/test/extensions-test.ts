import { InlineAnnotation } from '@atjson/document';
import * as MarkdownIt from 'markdown-it';
import CommonMarkSource from '../src';
import { render } from './utils';

class StrikeThrough extends InlineAnnotation {
  static vendorPrefix = 'commonmark';
  static type = 's';
}

class MarkdownItSource extends CommonMarkSource {
  static schema = [...CommonMarkSource.schema, StrikeThrough];
  static get markdownParser() {
    return MarkdownIt();
  }
}

describe('strikethrough', () => {
  test('~hello~ is converted to strikethrough annotations', () => {
    let doc = MarkdownItSource.fromSource('~~hello~~');
    expect(render(doc)).toBe('hello\n\n');
    let strikeThrough = doc.annotations.find(a => a.type === 's');
    expect(strikeThrough).toMatchObject({
      type: 's',
      attributes: {},
      start: 1,
      end: 8
    });
  });
});
