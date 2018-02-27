import Document from '@atjson/document';
import { Parser, schema } from '@atjson/source-commonmark';
import * as MarkdownIt from 'markdown-it';
import { render } from './utils';

class MarkdownItSource extends Document {
  constructor(markdown: string) {
    let md = MarkdownIt();
    let parser = new Parser(md.parse(markdown, {}), {});
    super({
      content: parser.content,
      contentType: 'text/commonmark',
      annotations: parser.annotations,
      schema
    });
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
