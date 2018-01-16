import { AtJSON } from '@atjson/core';
import CommonMarkRenderer from '@atjson/renderer-commonmark';

describe('commonmark', () => {
  it('raw atjson document', () => {
    let document = new AtJSON({
      content: 'Some text that is both bold and italic plus something after.',
      contentType: 'text/atjson',
      annotations: [
        { type: 'bold', start: 23, end: 31 },
        { type: 'italic', start: 28, end: 38 }
      ]
    });

    let renderer = new CommonMarkRenderer();
    expect(renderer.render(document)).toBe(
                 'Some text that is both **bold *and*** *italic* plus something after.');
  });

  it('a plain text document with virtual paragraphs', () => {
    let document = new AtJSON({
      content: 'A paragraph with some bold\n\ntext that continues into the next.',
      annotations: [
        { type: 'paragraph', start: 0, end: 28 },
        { type: 'parse-token', start: 26, end: 28 },
        { type: 'paragraph', start: 28, end: 62 },
        { type: 'bold', start: 22, end: 32 }
      ]
    });

    let renderer = new CommonMarkRenderer();
    expect(renderer.render(document)).toBe(
                 'A paragraph with some **bold**\n\n**text** that continues into the next.');
  });

  it('a list', () => {
    let document = new AtJSON({
      content: ['I have a list:',
                'First item plus bold text',
                'Second item plus italic text',
                'Item 2a',
                'Item 2b',
                'After all the lists'].join(''),
      annotations: [
        { type: 'paragraph', start: 0, end: 14 },
        { type: 'bold', start: 30, end: 34 },
        { type: 'italic', start: 56, end: 62 },
        { type: 'ordered-list', start: 14, end: 81 },
        { type: 'list-item', start: 14, end: 39 },
        { type: 'list-item', start: 39, end: 81 },
        { type: 'unordered-list', start: 67, end: 81 },
        { type: 'list-item', start: 67, end: 74 },
        { type: 'list-item', start: 74, end: 81 },
        { type: 'paragraph', start: 81, end: 100 }
      ]
    });

    let renderer = new CommonMarkRenderer();
    expect(renderer.render(document)).toBe(
                 `I have a list:

1. First item plus **bold** text
2. Second item plus *italic* text
   - Item 2a
   - Item 2b

After all the lists`);
  });

  it('links', () => {
    let document = new AtJSON({
      content: 'I have a link',
      annotations: [{
        type: 'link', start: 9, end: 13, attributes: {
          href: 'https://example.com'
        }
      }]
    });

    let renderer = new CommonMarkRenderer();
    expect(renderer.render(document)).toBe(
                 `I have a [link](https://example.com)`);
  });

  it('images', () => {
    let document = new AtJSON({
      content: ' ',
      annotations: [{
        type: 'image', start: 0, end: 0, attributes: {
          alt: 'CommonMark',
          url: 'http://commonmark.org/images/markdown-mark.png'
        }
      }]
    });

    let renderer = new CommonMarkRenderer();
    expect(renderer.render(document)).toBe(
                 `![CommonMark](http://commonmark.org/images/markdown-mark.png)`);
  });

  describe('blockquote', () => {
    it('single quote', () => {
      let document = new AtJSON({
        content: 'This is a quote\n\nThat has some\nlines in it.',
        annotations: [{
          type: 'blockquote', start: 0, end: 43
        }]
      });

      let renderer = new CommonMarkRenderer();
      expect(renderer.render(document)).toBe(
                   '> This is a quote\n> ' + `
> That has some
> lines in it.`);
    });

    it('with a paragraph', () => {
      let document = new AtJSON({
        content: 'This is a quoteAnd this is not.',
        annotations: [{
          type: 'blockquote', start: 0, end: 15
        }, {
          type: 'paragraph', start: 0, end: 15
        }, {
          type: 'paragraph', start: 15, end: 31
        }]
      });

      let renderer = new CommonMarkRenderer();
      expect(renderer.render(document)).toBe('> This is a quote\n\nAnd this is not.');
    });

    it('with flanking whitespace', () => {
      let document = new AtJSON({
        content: '\n\nThis is a quote\nAnd this is not.',
        annotations: [{
          type: 'blockquote', start: 0, end: 18
        }, {
          type: 'paragraph', start: 2, end: 18
        }, {
          type: 'paragraph', start: 18, end: 34
        }]
      });

      let renderer = new CommonMarkRenderer();
      expect(renderer.render(document)).toBe('> This is a quote\n\nAnd this is not.');
    });

    it('with surrounding paragraphs', () => {
      let document = new AtJSON({
        content: 'This is some text\n\nThis is a quote\n\nAnd this is not.',
        annotations: [{
          type: 'paragraph', start: 0, end: 19
        }, {
          type: 'parse-token', start: 17, end: 19
        }, {
          type: 'blockquote', start: 19, end: 36
        }, {
          type: 'paragraph', start: 19, end: 36
        }, {
          type: 'parse-token', start: 34, end: 36
        }, {
          type: 'paragraph', start: 36, end: 52
        }]
      });

      let renderer = new CommonMarkRenderer();
      expect(renderer.render(document)).toBe('This is some text\n\n> This is a quote\n\nAnd this is not.');
    });
  });

  it('handles horizontal-rules annotations', () => {
    let document = new AtJSON({
      content: 'x\uFFFCy',
      contentType: 'text/atjson',
      annotations: [
        { type: 'paragraph', start: 0, end: 1 },
        { type: 'horizontal-rule', start: 1, end: 2 },
        { type: 'paragraph', start: 2, end: 3 }
      ]
    });

    let renderer = new CommonMarkRenderer();
    expect(renderer.render(document)).toBe('x\n\n---\n\ny');
  });

  it('headlines', () => {
    let document = new AtJSON({
      content: 'Banner\nHeadline\n',
      annotations: [{
        type: 'heading', start: 0, end: 7, attributes: { level: 1 }
      }, {
        type: 'parse-token', start: 6, end: 7, attributes: { tokenType: 'newline' }
      }, {
        type: 'heading', start: 7, end: 16, attributes: { level: 2 }
      }, {
        type: 'parse-token', start: 15, end: 16, attributes: { tokenType: 'newline' }
      }]
    });

    let renderer = new CommonMarkRenderer();
    expect(renderer.render(document)).toBe(
                 `# Banner

## Headline`);
  });

  it('moves spaces at annotation boundaries to the outside', () => {
    let document = new AtJSON({
      content: 'This is bold text and a link.',
      annotations: [{
        type: 'bold', start: 8, end: 13
      }, {
        type: 'link', start: 23, end: 28, attributes: { href: 'https://example.com' }
      }]
    });

    let renderer = new CommonMarkRenderer();
    expect(renderer.render(document)).toBe('This is **bold** text and a [link](https://example.com).');
  });
});
