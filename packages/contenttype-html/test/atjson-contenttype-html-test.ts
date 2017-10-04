import { Parser } from '@atjson/contenttype-html';
import { AtJSON } from '@atjson/core';
import { HIR } from '@atjson/hir';

describe('@atjson/contenttype-html', function () {
  it('pre-code', function () {
    let html = '<pre><code>this <b>is</b> a test</code></pre>';

    let parser = new Parser(html);
    let parsedHtml = parser.parse();

    let htmlAtJSON = new AtJSON({
      content: html,
      contentType: 'text/html',
      annotations: parsedHtml
    });

    let hir = new HIR(htmlAtJSON).toJSON();

    expect(hir).toEqual({
      type: 'root',
      attributes: undefined,
      children: [
        { type: 'pre',
          attributes: {},
          children: [{
            type: 'code',
            attributes: {},
            children: [ 'this ', { type: 'b', attributes: {}, children: ['is'] }, ' a test' ]
          }]
        }]}
    );
  });

  it('<p>aaa<br />\nbbb</p>', function () {
    let html = '<p>aaa<br />\nbbb</p>';
    let parser = new Parser(html);
    let parsedHtml = parser.parse();

    let htmlAtJSON = new AtJSON({
      content: html,
      contentType: 'text/html',
      annotations: parsedHtml
    });

    let hir = new HIR(htmlAtJSON).toJSON();
    expect(hir).toEqual({
      type: 'root',
      attributes: undefined,
      children: [{
        type: 'paragraph',
        attributes: {},
        children: [
          'aaa', { type: 'br', attributes: {}, children: [] }, '\nbbb'
        ]
      }]
    });
  });

  it('<a href="https://example.com">example</a>', function () {
    let html = '<a href="https://example.com">example</a>';
    let parser = new Parser(html);
    let parsedHtml = parser.parse();

    let htmlAtJSON = new AtJSON({
      content: html,
      contentType: 'text/html',
      annotations: parsedHtml
    });

    let hir = new HIR(htmlAtJSON).toJSON();
    expect(hir).toEqual({
      type: 'root',
      attributes: undefined,
      children: [{
        type: 'a',
        attributes: {
          href: 'https://example.com'
        },
        children: ['example']
      }]
    });
  });

  it('<img src="https://example.com/test.png" /> ', function () {
    let html = '<img src="https://example.com/test.png" /> ';
    let parser = new Parser(html);
    let parsedHtml = parser.parse();

    let htmlAtJSON = new AtJSON({
      content: html,
      contentType: 'text/html',
      annotations: parsedHtml
    });

    let hir = new HIR(htmlAtJSON).toJSON();
    expect(hir).toEqual({
      type: 'root',
      attributes: undefined,
      children: [{
        type: 'image',
        attributes: {
          src: 'https://example.com/test.png'
        },
        children: []
      }, ' ']
    });
  });

  it('<h2></h2>\n<h1></h1>\n<h3></h3>', function () {
    let html = '<h2></h2>\n<h1></h1>\n<h3></h3>';
    let parser = new Parser(html);
    let parsedHtml = parser.parse();

    let htmlAtJSON = new AtJSON({
      content: html,
      contentType: 'text/html',
      annotations: parsedHtml
    });

    let hir = new HIR(htmlAtJSON).toJSON();
    expect(hir).toEqual({
      type: 'root',
      attributes: undefined,
      children: [{
        type: 'h2',
        attributes: {},
        children: []
      }, '\n', {
        type: 'h1',
        attributes: {},
        children: []
      }, '\n', {
        type: 'h3',
        attributes: {},
        children: []
      }]
    });
  });
});
