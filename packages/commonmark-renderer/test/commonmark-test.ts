import { module, test, TestCase, QUnitAssert } from './support';
import { AtJSON } from '@atjson/core';
import CommonMarkRenderer from '@atjson/commonmark-renderer';

@module("commonmark")
export class CommonMarkTest extends TestCase {
  @test
  "raw atjson document"(assert: QUnitAssert) {
    let document = new AtJSON({
      content: 'Some text that is both bold and italic plus something after.',
      contentType: 'text/atjson',
      annotations: [
        { type: 'bold', start: 23, end: 31 },
        { type: 'italic', start: 28, end: 38 }
      ]
    });

    let renderer = new CommonMarkRenderer();
    assert.equal(renderer.render(document),
                 'Some text that is both **bold *and**** italic* plus something after.');
  }

  @test
  "a plain text document with virtual paragraphs"(assert: QUnitAssert) {
    let document = new AtJSON({
      content: 'A paragraph with some bold\n\ntext that continues into the next.',
      annotations: [
        { type: 'paragraph', start: 0, end: 26 },
        { type: 'parse-token', start: 26, end: 28 },
        { type: 'paragraph', start: 28, end: 62 },
        { type: 'bold', start: 22, end: 32 }
      ]
    });

    let renderer = new CommonMarkRenderer();
    assert.equal(renderer.render(document),
                 'A paragraph with some **bold**\n\n**text** that continues into the next.');
  }

  @test
  "a list"(assert: QUnitAssert) {
    let document = new AtJSON({
      content: 'I have a list:\n\nFirst item plus bold text\nSecond item plus italic text\nItem 2a\nItem 2b\n\nAfter all the lists',
      annotations: [
        { type: 'bold', start: 32, end: 36 },
        { type: 'italic', start: 59, end: 65 },
        { type: 'ordered-list', start: 16, end: 87 },
        { type: 'list-item', start: 16, end: 42 },
        { type: 'list-item', start: 42, end: 87 },
        { type: 'unordered-list', start: 70, end: 87 },
        { type: 'list-item', start: 70, end: 78 },
        { type: 'list-item', start: 78, end: 87 }
      ]
    });

    let renderer = new CommonMarkRenderer();
    assert.equal(renderer.render(document),
                 `I have a list:

1. First item plus **bold** text
2. Second item plus *italic* text
   - Item 2a
   - Item 2b

After all the lists`);
  }

  @test
  "links"(assert: QUnitAssert) {
    let document = new AtJSON({
      content: 'I have a link',
      annotations: [{
        type: 'link', start: 9, end: 13, attributes: {
          url: 'https://example.com'
        }
      }]
    });

    let renderer = new CommonMarkRenderer();
    assert.equal(renderer.render(document),
                 `I have a [link](https://example.com)`);
  }

  @test
  "images"(assert: QUnitAssert) {
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
    assert.equal(renderer.render(document),
                 `![CommonMark](http://commonmark.org/images/markdown-mark.png)`);
  }

  @test
  "block quote"(assert: QUnitAssert) {
    let document = new AtJSON({
      content: 'This is a quote\n\nThat has some\nlines in it.',
      annotations: [{
        type: 'blockquote', start: 0, end: 43
      }]
    });

    let renderer = new CommonMarkRenderer();
    assert.equal(renderer.render(document),
                 `> This is a quote
> 
> That has some
> lines in it.`);
  }

  @test
  "headlines"(assert: QUnitAssert) {
    let document = new AtJSON({
      content: 'Banner\nHeadline\n',
      annotations: [{
        type: 'heading', start: 0, end: 6, attributes: { size: 1 }
      }, {
        type: 'heading', start: 7, end: 15, attributes: { size: 2 }
      }]
    });

    let renderer = new CommonMarkRenderer();
    assert.equal(renderer.render(document),
                 `# Banner
## Headline`);
  }
};
