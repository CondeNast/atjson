import { module, test, TestCase, QUnitAssert } from './support';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { HIR } from 'atjson-hir';
import { ReactRenderer } from 'atjson-renderer-markdown';

@module("markdown")
export class MarkdownTest extends TestCase {
  @test
  "raw atjson document"(assert: QUnitAssert) {
    let hir = new HIR({
      content: 'Some text that is both bold and italic plus something after.',
      contentType: 'text/atjson',
      annotations: [
        { type: 'bold', start: 23, end: 31 },
        { type: 'italic', start: 28, end: 38 }
      ]
    });

    let renderer = new ReactRenderer(hir);
    assert.equal(ReactDOMServer.renderToStaticMarkup(renderer.compile()),
                 'Some text that is both **bold *and**** italic* plus something after.');
  }

  @test
  "a plain text document with virtual paragraphs"(assert: QUnitAssert) {
    let hir = new HIR({
      content: 'A paragraph with some bold\n\ntext that continues into the next.',
      annotations: [
        { type: 'bold', start: 22, end: 32 }
      ]
    });

    console.log(hir.toJSON())

    let renderer = new ReactRenderer(hir);
    assert.equal(ReactDOMServer.renderToStaticMarkup(renderer.compile()),
                 'A paragraph with some **bold**\n\n**text** that continues into the next.');
  }

  @test
  "a list"(assert: QUnitAssert) {
    let hir = new HIR({
      content: 'I have a list:\n\nFirst item plus bold text\n\nSecond item plus italic text\n\nItem 2a\n\nItem 2b\n\nAfter all the lists',
      annotations: [
        { type: 'bold', start: 32, end: 36 },
        { type: 'italic', start: 60, end: 66 },
        { type: 'ordered-list', start: 16, end: 91 },
        { type: 'list-item', start: 16, end: 43 },
        { type: 'list-item', start: 43, end: 91 },
        { type: 'ordered-list', start: 73, end: 91 },
        { type: 'list-item', start: 73, end: 82 },
        { type: 'list-item', start: 82, end: 91 }
      ]
    });

    let renderer = new ReactRenderer(hir);
    assert.equal(ReactDOMServer.renderToStaticMarkup(renderer.compile()),
                 `I have a list:

1. First item plus **bold** text
2. Second item plus *italic* text
   1. Item 2a
   2. Item 2b

After all the lists
`);
  }

  @test
  "links"(assert: QUnitAssert) {
    let hir = new HIR({
      content: 'Linky!',
      annotations: [{
        type: 'link', start: 0, end: 6, data: {
          url: 'https://example.com'
        }
      }]
    });

    let renderer = new ReactRenderer(hir);
    assert.equal(ReactDOMServer.renderToStaticMarkup(renderer.compile()),
                 `I have a [list](https://example.com)`);
  }
};
