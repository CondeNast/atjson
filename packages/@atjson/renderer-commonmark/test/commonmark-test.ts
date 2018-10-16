import Document from '@atjson/document';
import CommonMarkSource from '@atjson/source-commonmark';
import CommonMarkRenderer from '../src';

describe('commonmark', () => {
  it('raw atjson document', () => {
    let document = new Document({
      content: 'Some text that is both bold and italic plus something after.',
      annotations: [
        { id: '1', type: 'bold', start: 23, end: 31, attributes: {} },
        { id: '2', type: 'italic', start: 28, end: 38, attributes: {} }
      ]
    });

    let renderer = new CommonMarkRenderer();
    expect(renderer.render(document)).toBe('Some text that is both **bold *and*** *italic* plus something after.');
  });

  it('sub-documents', () => {
    let document = new Document({
      content: '\uFFFC',
      annotations: [{
        id: '1',
        type: 'image',
        start: 0,
        end: 1,
        attributes: {
          url: 'http://commonmark.org/images/markdown-mark.png',
          description: new Document({
            content: 'Hello!',
            annotations: [{
              id: '2',
              type: 'bold',
              start: 0,
              end: 5,
              attributes: {}
            }]
          })
        }
      }]
    });

    let renderer = new CommonMarkRenderer();
    expect(renderer.render(document)).toBe('![**Hello**\\!](http://commonmark.org/images/markdown-mark.png)');
  });

  it('a plain text document with virtual paragraphs', () => {
    let document = new Document({
      content: 'A paragraph with some bold\n\ntext that continues into the next.',
      annotations: [
        { id: '1', type: 'paragraph', start: 0, end: 28, attributes: {} },
        { id: '2', type: 'parse-token', start: 26, end: 28, attributes: {} },
        { id: '3', type: 'paragraph', start: 28, end: 62, attributes: {} },
        { id: '4', type: 'bold', start: 22, end: 32, attributes: {} }
      ]
    });

    let renderer = new CommonMarkRenderer();
    expect(renderer.render(document)).toBe(
                 'A paragraph with some **bold**\n\n**text** that continues into the next.\n\n');
  });

  it('a list', () => {
    let document = new Document({
      content: ['I have a list:',
                'First item plus bold text',
                'Second item plus italic text',
                'Item 2a',
                'Item 2b',
                'After all the lists'].join(''),
      annotations: [
        { id: '1', type: 'paragraph', start: 0, end: 14, attributes: {} },
        { id: '2', type: 'bold', start: 30, end: 34, attributes: {} },
        { id: '3', type: 'italic', start: 56, end: 62, attributes: {} },
        { id: '4', type: 'list', attributes: { type: 'numbered', tight: true }, start: 14, end: 81 },
        { id: '5', type: 'list-item', start: 14, end: 39, attributes: {} },
        { id: '6', type: 'paragraph', start: 14, end: 39, attributes: {} },
        { id: '7', type: 'list-item', start: 39, end: 81, attributes: {} },
        { id: '8', type: 'paragraph', start: 39, end: 67, attributes: {} },
        { id: '9', type: 'list', attributes: { type: 'bulleted', tight: true }, start: 67, end: 81 },
        { id: '10', type: 'list-item', start: 67, end: 74, attributes: {} },
        { id: '11', type: 'paragraph', start: 67, end: 74, attributes: {} },
        { id: '12', type: 'list-item', start: 74, end: 81, attributes: {} },
        { id: '13', type: 'paragraph', start: 74, end: 81, attributes: {} },
        { id: '14', type: 'paragraph', start: 81, end: 100, attributes: {} }
      ]
    });

    let renderer = new CommonMarkRenderer();
    expect(renderer.render(document)).toBe(
                 `I have a list:

1. First item plus **bold** text
2. Second item plus *italic* text
   - Item 2a
   - Item 2b

After all the lists

`);
  });

  it('links', () => {
    let document = new Document({
      content: 'I have a link',
      annotations: [{
        id: '1',
        type: 'link',
        start: 9,
        end: 13,
        attributes: {
          url: 'https://example.com'
        }
      }]
    });

    let renderer = new CommonMarkRenderer();
    expect(renderer.render(document)).toBe('I have a [link](https://example.com)');
  });

  it('images', () => {
    let document = new Document({
      content: '\uFFFC',
      annotations: [{
        id: '1',
        type: 'image',
        start: 0,
        end: 1,
        attributes: {
          description: 'CommonMark',
          url: 'http://commonmark.org/images/markdown-mark.png'
        }
      }]
    });

    let renderer = new CommonMarkRenderer();
    expect(renderer.render(document)).toBe('![CommonMark](http://commonmark.org/images/markdown-mark.png)');
  });

  describe('blockquote', () => {
    it('single quote', () => {
      let document = new Document({
        content: 'This is a quote\n\nThat has some\nlines in it.',
        annotations: [{
          id: '1',
          type: 'blockquote',
          start: 0,
          end: 43,
          attributes: {}
        }]
      });

      let renderer = new CommonMarkRenderer();
      expect(renderer.render(document)).toBe('> This is a quote\n> \n> That has some\n> lines in it.\n\n');
    });

    it('with a paragraph', () => {
      let document = new Document({
        content: 'This is a quoteAnd this is not.',
        annotations: [{
          id: '1',
          type: 'blockquote',
          start: 0,
          end: 15,
          attributes: {}
        }, {
          id: '2',
          type: 'paragraph',
          start: 0,
          end: 15,
          attributes: {}
        }, {
          id: '3',
          type: 'paragraph',
          start: 15,
          end: 31,
          attributes: {}
        }]
      });

      let renderer = new CommonMarkRenderer();
      expect(renderer.render(document)).toBe('> This is a quote\n\nAnd this is not.\n\n');
    });

    it('with flanking whitespace', () => {
      let document = new Document({
        content: '\n\nThis is a quote\nAnd this is not.',
        annotations: [{
          id: '1',
          type: 'blockquote',
          start: 0,
          end: 18,
          attributes: {}
        }, {
          id: '2',
          type: 'paragraph',
          start: 2,
          end: 18,
          attributes: {}
        }, {
          id: '3',
          type: 'paragraph',
          start: 18,
          end: 34,
          attributes: {}
        }]
      });

      let renderer = new CommonMarkRenderer();
      expect(renderer.render(document)).toBe('> This is a quote\n\nAnd this is not.\n\n');
    });

    it('with surrounding paragraphs', () => {
      let document = new Document({
        content: 'This is some text\n\nThis is a quote\n\nAnd this is not.',
        annotations: [{
          id: '1',
          type: 'paragraph',
          start: 0,
          end: 19,
          attributes: {}
        }, {
          id: '2',
          type: 'parse-token',
          start: 17,
          end: 19,
          attributes: {}
        }, {
          id: '3',
          type: 'blockquote',
          start: 19,
          end: 36,
          attributes: {}
        }, {
          id: '4',
          type: 'paragraph',
          start: 19,
          end: 36,
          attributes: {}
        }, {
          id: '5',
          type: 'parse-token',
          start: 34,
          end: 36,
          attributes: {}
        }, {
          id: '6',
          type: 'paragraph',
          start: 36,
          end: 52,
          attributes: {}
        }]
      });

      let renderer = new CommonMarkRenderer();
      expect(renderer.render(document)).toBe('This is some text\n\n> This is a quote\n\nAnd this is not.\n\n');
    });
  });

  it('handles horizontal-rules annotations', () => {
    let document = new Document({
      content: 'x\uFFFCy',
      annotations: [
        { id: '1', type: 'paragraph', start: 0, end: 1, attributes: {} },
        { id: '2', type: 'horizontal-rule', start: 1, end: 2, attributes: {} },
        { id: '3', type: 'paragraph', start: 2, end: 3, attributes: {} }
      ]
    });

    let renderer = new CommonMarkRenderer();
    expect(renderer.render(document)).toBe('x\n\n***\ny\n\n');
  });

  it('headlines', () => {
    let document = new Document({
      content: 'Banner\nHeadline\n',
      annotations: [{
        id: '1', type: 'heading', start: 0, end: 7, attributes: { level: 1 }
      }, {
        id: '2', type: 'parse-token', start: 6, end: 7, attributes: { tokenType: 'newline' }
      }, {
        id: '3', type: 'heading', start: 7, end: 16, attributes: { level: 2 }
      }, {
        id: '4', type: 'parse-token', start: 15, end: 16, attributes: { tokenType: 'newline' }
      }]
    });

    let renderer = new CommonMarkRenderer();
    expect(renderer.render(document)).toBe('# Banner\n## Headline\n');
  });

  it('moves spaces at annotation boundaries to the outside', () => {
    let document = new Document({
      content: 'This is bold text and a link.',
      annotations: [{
        id: '1', type: 'bold', start: 8, end: 13, attributes: {}
      }, {
        id: '2', type: 'link', start: 23, end: 28, attributes: { url: 'https://example.com' }
      }]
    });

    let renderer = new CommonMarkRenderer();
    expect(renderer.render(document)).toBe('This is **bold** text and a [link](https://example.com).');
  });

  test('unambiguous nesting of bold and italic', () => {
    let document = new Document({
      content: '\uFFFCbold then italic\uFFFC \uFFFCitalic then bold\uFFFC',
      annotations: [{
        id: '1', type: 'parse-token', start: 0, end: 1, attributes: {}
      }, {
        id: '2', type: 'bold', start: 0, end: 18, attributes: {}
      }, {
        id: '3', type: 'italic', start: 1, end: 17, attributes: {}
      }, {
        id: '4', type: 'parse-token', start: 17, end: 18, attributes: {}
      }, {
        id: '5', type: 'parse-token', start: 19, end: 20, attributes: {}
      }, {
        id: '6', type: 'italic', start: 19, end: 37, attributes: {}
      }, {
        id: '7', type: 'bold', start: 20, end: 36, attributes: {}
      }, {
        id: '8', type: 'parse-token', start: 36, end: 37, attributes: {}
      }]
    });

    let renderer = new CommonMarkRenderer();
    expect(renderer.render(document)).toBe('**_bold then italic_** *__italic then bold__*');
  });

  test('adjacent bold and italic annotations are given unique markdown makers', () => {
    let document = new Document({
      content: '\uFFFCbold\uFFFC\uFFFC, then italic\uFFFC\n\uFFFCitalic\uFFFC\uFFFC, then bold\uFFFC\n',
      annotations: [{
        id: '1', type: 'paragraph', start: 0, end: 21, attributes: {}
      }, {
        id: '2', type: 'parse-token', start: 0, end: 1, attributes: {}
      }, {
        id: '3', type: 'bold', start: 0, end: 6, attributes: {}
      }, {
        id: '4', type: 'parse-token', start: 5, end: 6, attributes: {}
      }, {
        id: '5', type: 'parse-token', start: 6, end: 7, attributes: {}
      }, {
        id: '6', type: 'italic', start: 6, end: 21, attributes: {}
      }, {
        id: '7', type: 'parse-token', start: 20, end: 21, attributes: {}
      }, {
        id: '8', type: 'parse-token', start: 21, end: 22, attributes: {}
      }, {
        id: '9', type: 'paragraph', start: 22, end: 43, attributes: {}
      }, {
        id: '10', type: 'parse-token', start: 22, end: 23, attributes: {}
      }, {
        id: '11', type: 'italic', start: 23, end: 30, attributes: {}
      }, {
        id: '12', type: 'parse-token', start: 29, end: 30, attributes: {}
      }, {
        id: '13', type: 'parse-token', start: 30, end: 31, attributes: {}
      }, {
        id: '14', type: 'bold', start: 30, end: 42, attributes: {}
      }, {
        id: '15', type: 'parse-token', start: 42, end: 43, attributes: {}
      }, {
        id: '16', type: 'parse-token', start: 43, end: 44, attributes: {}
      }]
    });

    let renderer = new CommonMarkRenderer();
    expect(renderer.render(document)).toBe('**bold**_, then italic_\n\n_italic_**, then bold**\n\n');
  });

  test('empty format strings are removed', () => {
    let document = new Document({
      content: 'Some formatting on empty spaces',
      annotations: [{
        id: '1', type: 'bold', start: 0, end: 0, attributes: {}
      }, {
        id: '2', type: 'italic', start: 4, end: 5, attributes: {}
      }]
    });

    let renderer = new CommonMarkRenderer();
    expect(renderer.render(document)).toBe('Some formatting on empty spaces');
  });

  test('non-breaking spaces don\'t recieve formatting', () => {
    let document = new Document({
      content: '\u00A0\ntext\n\u202F',
      annotations: [{
        id: '1', type: 'bold', start: 0, end: 7, attributes: {}
      }, {
        id: '2', type: 'paragraph', start: 0, end: 2, attributes: {}
      }, {
        id: '3', type: 'parse-token', start: 1, end: 2, attributes: {}
      }, {
        id: '4', type: 'paragraph', start: 2, end: 7, attributes: {}
      }, {
        id: '5', type: 'parse-token', start: 6, end: 7, attributes: {}
      }]
    });

    let renderer = new CommonMarkRenderer();
    expect(renderer.render(document)).toBe('&nbsp;\n\n**text**\n\n\u202F');
  });

  test('line feed characters don\'t recieve formatting', () => {
    let document = new Document({
      content: '\u000b\ntext\n',
      annotations: [{
        id: '1', type: 'bold', start: 0, end: 7, attributes: {}
      }, {
        id: '2', type: 'paragraph', start: 0, end: 2, attributes: {}
      }, {
        id: '3', type: 'parse-token', start: 1, end: 2, attributes: {}
      }, {
        id: '4', type: 'paragraph', start: 2, end: 7, attributes: {}
      }, {
        id: '5', type: 'parse-token', start: 6, end: 7, attributes: {}
      }]
    });

    let renderer = new CommonMarkRenderer();
    expect(renderer.render(document)).toBe('\u000b\n\n**text**\n\n');
  });

  test('tabs and leading / trailing spaces are stripped from output', () => {
    let document = new Document({
      content: '\tHello \n    This is my text',
      annotations: [{
        id: '1', type: 'paragraph', start: 0, end: 8, attributes: {}
      }, {
        id: '2', type: 'paragraph', start: 8, end: 27, attributes: {}
      }]
    });

    let renderer = new CommonMarkRenderer();
    let markdown = renderer.render(document);

    expect(renderer.render(document)).toBe('Hello\n\nThis is my text\n\n');
    // Make sure we're not generating code in the round-trip
    expect(markdown).toEqual(renderer.render(new CommonMarkSource(markdown).toCommonSchema()));
  });
});
