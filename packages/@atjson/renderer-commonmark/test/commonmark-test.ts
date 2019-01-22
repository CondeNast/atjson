import OffsetSource from '@atjson/offset-annotations';
import CommonMarkSource from '@atjson/source-commonmark';
import CommonMarkRenderer from '../src';

describe('commonmark', () => {
  test('raw atjson document', () => {
    let document = new OffsetSource({
      content: 'Some text that is both bold and italic plus something after.',
      annotations: [
        { id: '1', type: '-offset-bold', start: 23, end: 31, attributes: {} },
        { id: '2', type: '-offset-italic', start: 28, end: 38, attributes: {} }
      ]
    });

    expect(CommonMarkRenderer.render(document)).toBe('Some text that is both **bold *and*** *italic* plus something after.');
  });

  test('images', () => {
    let document = new OffsetSource({
      content: '\uFFFC',
      annotations: [{
        id: '1',
        type: '-offset-image',
        start: 0,
        end: 1,
        attributes: {
          '-offset-url': 'http://commonmark.org/images/markdown-mark.png',
          '-offset-description': {
            content: 'CommonMark!',
            annotations: [{
              id: '2',
              type: '-offset-bold',
              start: 0,
              end: 10,
              attributes: {}
            }]
          }
        }
      }]
    });

    expect(CommonMarkRenderer.render(document)).toBe('![**CommonMark**\\!](http://commonmark.org/images/markdown-mark.png)');
  });

  test('a plain text document with virtual paragraphs', () => {
    let document = new OffsetSource({
      content: 'A paragraph with some bold\n\ntext that continues into the next.',
      annotations: [
        { id: '1', type: '-offset-paragraph', start: 0, end: 28, attributes: {} },
        { id: '2', type: '-atjson-parse-token', start: 26, end: 28, attributes: {} },
        { id: '3', type: '-offset-paragraph', start: 28, end: 62, attributes: {} },
        { id: '4', type: '-offset-bold', start: 22, end: 32, attributes: {} }
      ]
    });

    expect(CommonMarkRenderer.render(document)).toBe(
                 'A paragraph with some **bold**\n\n**text** that continues into the next.\n\n');
  });

  test('a list', () => {
    let document = new OffsetSource({
      content: ['I have a list:',
                'First item plus bold text',
                'Second item plus italic text',
                'Item 2a',
                'Item 2b',
                'After all the lists'].join(''),
      annotations: [
        { id: '1', type: '-offset-paragraph', start: 0, end: 14, attributes: {} },
        { id: '2', type: '-offset-bold', start: 30, end: 34, attributes: {} },
        { id: '3', type: '-offset-italic', start: 56, end: 62, attributes: {} },
        { id: '4', type: '-offset-list', attributes: { '-offset-type': 'numbered', '-offset-tight': true }, start: 14, end: 81 },
        { id: '5', type: '-offset-list-item', start: 14, end: 39, attributes: {} },
        { id: '6', type: '-offset-paragraph', start: 14, end: 39, attributes: {} },
        { id: '7', type: '-offset-list-item', start: 39, end: 81, attributes: {} },
        { id: '8', type: '-offset-paragraph', start: 39, end: 67, attributes: {} },
        { id: '9', type: '-offset-list', attributes: { '-offset-type': 'bulleted', '-offset-tight': true }, start: 67, end: 81 },
        { id: '10', type: '-offset-list-item', start: 67, end: 74, attributes: {} },
        { id: '11', type: '-offset-paragraph', start: 67, end: 74, attributes: {} },
        { id: '12', type: '-offset-list-item', start: 74, end: 81, attributes: {} },
        { id: '13', type: '-offset-paragraph', start: 74, end: 81, attributes: {} },
        { id: '14', type: '-offset-paragraph', start: 81, end: 100, attributes: {} }
      ]
    });

    expect(CommonMarkRenderer.render(document)).toBe(
                 `I have a list:

1. First item plus **bold** text
2. Second item plus *italic* text
   - Item 2a
   - Item 2b

After all the lists

`);
  });

  test('links', () => {
    let document = new OffsetSource({
      content: 'I have a link',
      annotations: [{
        id: '1',
        type: '-offset-link',
        start: 9,
        end: 13,
        attributes: {
          '-offset-url': 'https://example.com'
        }
      }]
    });

    expect(CommonMarkRenderer.render(document)).toBe('I have a [link](https://example.com)');
  });

  describe('blockquote', () => {
    test('single quote', () => {
      let document = new OffsetSource({
        content: 'This is a quote\n\nThat has some\nlines in it.',
        annotations: [{
          id: '1',
          type: '-offset-blockquote',
          start: 0,
          end: 43,
          attributes: {}
        }]
      });

      expect(CommonMarkRenderer.render(document)).toBe('> This is a quote\n> \n> That has some\n> lines in it.\n\n');
    });

    test('with a paragraph', () => {
      let document = new OffsetSource({
        content: 'This is a quoteAnd this is not.',
        annotations: [{
          id: '1',
          type: '-offset-blockquote',
          start: 0,
          end: 15,
          attributes: {}
        }, {
          id: '2',
          type: '-offset-paragraph',
          start: 0,
          end: 15,
          attributes: {}
        }, {
          id: '3',
          type: '-offset-paragraph',
          start: 15,
          end: 31,
          attributes: {}
        }]
      });

      expect(CommonMarkRenderer.render(document)).toBe('> This is a quote\n\nAnd this is not.\n\n');
    });

    test('with flanking whitespace', () => {
      let document = new OffsetSource({
        content: '\n\nThis is a quote\nAnd this is not.',
        annotations: [{
          id: '1',
          type: '-offset-blockquote',
          start: 0,
          end: 18,
          attributes: {}
        }, {
          id: '2',
          type: '-offset-paragraph',
          start: 2,
          end: 18,
          attributes: {}
        }, {
          id: '3',
          type: '-offset-paragraph',
          start: 18,
          end: 34,
          attributes: {}
        }]
      });

      expect(CommonMarkRenderer.render(document)).toBe('> This is a quote\n\nAnd this is not.\n\n');
    });

    test('with surrounding paragraphs', () => {
      let document = new OffsetSource({
        content: 'This is some text\n\nThis is a quote\n\nAnd this is not.',
        annotations: [{
          id: '1',
          type: '-offset-paragraph',
          start: 0,
          end: 19,
          attributes: {}
        }, {
          id: '2',
          type: '-atjson-parse-token',
          start: 17,
          end: 19,
          attributes: {}
        }, {
          id: '3',
          type: '-offset-blockquote',
          start: 19,
          end: 36,
          attributes: {}
        }, {
          id: '4',
          type: '-offset-paragraph',
          start: 19,
          end: 36,
          attributes: {}
        }, {
          id: '5',
          type: '-atjson-parse-token',
          start: 34,
          end: 36,
          attributes: {}
        }, {
          id: '6',
          type: '-offset-paragraph',
          start: 36,
          end: 52,
          attributes: {}
        }]
      });

      expect(CommonMarkRenderer.render(document)).toBe('This is some text\n\n> This is a quote\n\nAnd this is not.\n\n');
    });
  });

  test('handles horizontal-rules annotations', () => {
    let document = new OffsetSource({
      content: 'x\uFFFCy',
      annotations: [
        { id: '1', type: '-offset-paragraph', start: 0, end: 1, attributes: {} },
        { id: '2', type: '-offset-horizontal-rule', start: 1, end: 2, attributes: {} },
        { id: '3', type: '-offset-paragraph', start: 2, end: 3, attributes: {} }
      ]
    });

    expect(CommonMarkRenderer.render(document)).toBe('x\n\n***\ny\n\n');
  });

  test('headlines', () => {
    let document = new OffsetSource({
      content: 'Banner\nHeadline\n',
      annotations: [{
        id: '1', type: '-offset-heading', start: 0, end: 7, attributes: { '-offset-level': 1 }
      }, {
        id: '2', type: '-atjson-parse-token', start: 6, end: 7, attributes: { '-atjson-reason': 'newline' }
      }, {
        id: '3', type: '-offset-heading', start: 7, end: 16, attributes: { '-offset-level': 2 }
      }, {
        id: '4', type: '-atjson-parse-token', start: 15, end: 16, attributes: { '-atjson-reason': 'newline' }
      }]
    });

    expect(CommonMarkRenderer.render(document)).toBe('# Banner\n## Headline\n');
  });

  test('moves spaces at annotation boundaries to the outside', () => {
    let document = new OffsetSource({
      content: 'This is bold text and a link.',
      annotations: [{
        id: '1', type: '-offset-bold', start: 8, end: 13, attributes: {}
      }, {
        id: '2', type: '-offset-link', start: 23, end: 28, attributes: { '-offset-url': 'https://example.com' }
      }]
    });

    expect(CommonMarkRenderer.render(document)).toBe('This is **bold** text and a [link](https://example.com).');
  });

  test('unambiguous nesting of bold and italic', () => {
    let document = new OffsetSource({
      content: '\uFFFCbold then italic\uFFFC \uFFFCitalic then bold\uFFFC',
      annotations: [{
        id: '1', type: '-atjson-parse-token', start: 0, end: 1, attributes: {}
      }, {
        id: '2', type: '-offset-bold', start: 0, end: 18, attributes: {}
      }, {
        id: '3', type: '-offset-italic', start: 1, end: 17, attributes: {}
      }, {
        id: '4', type: '-atjson-parse-token', start: 17, end: 18, attributes: {}
      }, {
        id: '5', type: '-atjson-parse-token', start: 19, end: 20, attributes: {}
      }, {
        id: '6', type: '-offset-italic', start: 19, end: 37, attributes: {}
      }, {
        id: '7', type: '-offset-bold', start: 20, end: 36, attributes: {}
      }, {
        id: '8', type: '-atjson-parse-token', start: 36, end: 37, attributes: {}
      }]
    });

    expect(CommonMarkRenderer.render(document)).toBe('**_bold then italic_** *__italic then bold__*');
  });

  test('adjacent bold and italic annotations are given unique markdown makers', () => {
    let document = new OffsetSource({
      content: '\uFFFCbold\uFFFC\uFFFC, then italic\uFFFC\n\uFFFCitalic\uFFFC\uFFFC, then bold\uFFFC\n',
      annotations: [{
        id: '1', type: '-offset-paragraph', start: 0, end: 21, attributes: {}
      }, {
        id: '2', type: '-atjson-parse-token', start: 0, end: 1, attributes: {}
      }, {
        id: '3', type: '-offset-bold', start: 0, end: 6, attributes: {}
      }, {
        id: '4', type: '-atjson-parse-token', start: 5, end: 6, attributes: {}
      }, {
        id: '5', type: '-atjson-parse-token', start: 6, end: 7, attributes: {}
      }, {
        id: '6', type: '-offset-italic', start: 6, end: 21, attributes: {}
      }, {
        id: '7', type: '-atjson-parse-token', start: 20, end: 21, attributes: {}
      }, {
        id: '8', type: '-atjson-parse-token', start: 21, end: 22, attributes: {}
      }, {
        id: '9', type: '-offset-paragraph', start: 22, end: 43, attributes: {}
      }, {
        id: '10', type: '-atjson-parse-token', start: 22, end: 23, attributes: {}
      }, {
        id: '11', type: '-offset-italic', start: 23, end: 30, attributes: {}
      }, {
        id: '12', type: '-atjson-parse-token', start: 29, end: 30, attributes: {}
      }, {
        id: '13', type: '-atjson-parse-token', start: 30, end: 31, attributes: {}
      }, {
        id: '14', type: '-offset-bold', start: 30, end: 42, attributes: {}
      }, {
        id: '15', type: '-atjson-parse-token', start: 42, end: 43, attributes: {}
      }, {
        id: '16', type: '-atjson-parse-token', start: 43, end: 44, attributes: {}
      }]
    });

    expect(CommonMarkRenderer.render(document)).toBe('**bold**_, then italic_\n\n_italic_**, then bold**\n\n');
  });

  test('empty format strings are removed', () => {
    let document = new OffsetSource({
      content: 'Some formatting on empty spaces',
      annotations: [{
        id: '1', type: '-offset-bold', start: 0, end: 0, attributes: {}
      }, {
        id: '2', type: '-offset-italic', start: 4, end: 5, attributes: {}
      }]
    });

    expect(CommonMarkRenderer.render(document)).toBe('Some formatting on empty spaces');
  });

  test('non-breaking spaces don\'t receive formatting', () => {
    let document = new OffsetSource({
      content: '\u00A0\ntext\n\u202F',
      annotations: [{
        id: '1', type: '-offset-bold', start: 0, end: 7, attributes: {}
      }, {
        id: '2', type: '-offset-paragraph', start: 0, end: 2, attributes: {}
      }, {
        id: '3', type: '-atjson-parse-token', start: 1, end: 2, attributes: {}
      }, {
        id: '4', type: '-offset-paragraph', start: 2, end: 7, attributes: {}
      }, {
        id: '5', type: '-atjson-parse-token', start: 6, end: 7, attributes: {}
      }]
    });

    expect(CommonMarkRenderer.render(document)).toBe('&nbsp;\n\n**text**\n\n\u202F');
  });

  test('line feed characters don\'t recieve formatting', () => {
    let document = new OffsetSource({
      content: '\u000b\ntext\n',
      annotations: [{
        id: '1', type: '-offset-bold', start: 0, end: 7, attributes: {}
      }, {
        id: '2', type: '-offset-paragraph', start: 0, end: 2, attributes: {}
      }, {
        id: '3', type: '-atjson-parse-token', start: 1, end: 2, attributes: {}
      }, {
        id: '4', type: '-offset-paragraph', start: 2, end: 7, attributes: {}
      }, {
        id: '5', type: '-atjson-parse-token', start: 6, end: 7, attributes: {}
      }]
    });

    expect(CommonMarkRenderer.render(document)).toBe('\u000b\n\n**text**\n\n');
  });

  test('tabs and leading / trailing spaces are stripped from output', () => {
    let document = new OffsetSource({
      content: '\tHello \n    This is my text',
      annotations: [{
        id: '1', type: '-offset-paragraph', start: 0, end: 8, attributes: {}
      }, {
        id: '2', type: '-offset-paragraph', start: 8, end: 27, attributes: {}
      }]
    });

    let markdown = CommonMarkRenderer.render(document);

    expect(CommonMarkRenderer.render(document)).toBe('Hello\n\nThis is my text\n\n');
    // Make sure we're not generating code in the round-trip
    expect(markdown).toEqual(CommonMarkRenderer.render(CommonMarkSource.fromRaw(markdown).convertTo(OffsetSource)));
  });

  describe('escape sequences', () => {
    describe('numbers', () => {
      test.each([
        '5.8 million',
        'in 2016.',
        '2.0',
        '$280,000.'
      ])('%s is not escaped', text => {
        let document = new OffsetSource({
          content: text,
          annotations: []
        });

        expect(CommonMarkRenderer.render(document)).toBe(text);
      });
    });

    describe('sic / citations', () => {
      test.each([
        '“[We] are',
        '“[Our algorithm] allows',
        'surpass [rival software] C',
        'for [my district] in 2016'
      ])('%s is not escaped', text => {
        let document = new OffsetSource({
          content: text,
          annotations: []
        });

        expect(CommonMarkRenderer.render(document)).toBe(text);
      });
    });
  });
});
