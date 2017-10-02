import { AtJSON } from '@atjson/core';
import { Parser } from '@atjson/contenttype-html';
import { HIR } from '@atjson/hir';

QUnit.module('@atjson/contenttype-html tests');

QUnit.test('pre-code', assert => {
  let html = '<pre><code>this <b>is</b> a test</code></pre>';

  let parser = new Parser(html);
  let parsedHtml = parser.parse();

  let htmlAtJSON = new AtJSON({
    content: html,
    contentType: 'text/html',
    annotations: parsedHtml
  });

  let hir = new HIR(htmlAtJSON).toJSON();

  assert.deepEqual(hir, {
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

QUnit.test('<p>aaa<br />\nbbb</p>', assert => {
  let html = '<p>aaa<br />\nbbb</p>';
  let parser = new Parser(html);
  let parsedHtml = parser.parse();

  let htmlAtJSON = new AtJSON({
    content: html,
    contentType: 'text/html',
    annotations: parsedHtml
  });

  let hir = new HIR(htmlAtJSON).toJSON();
  assert.deepEqual(hir, {
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

QUnit.test('<a href="https://example.com">example</a>', assert => {
  let html = '<a href="https://example.com">example</a>';
  let parser = new Parser(html);
  let parsedHtml = parser.parse();

  let htmlAtJSON = new AtJSON({
    content: html,
    contentType: 'text/html',
    annotations: parsedHtml
  });

  let hir = new HIR(htmlAtJSON).toJSON();
  assert.deepEqual(hir, {
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

QUnit.test('<img src="https://example.com/test.png" /> ', assert => {
  let html = '<img src="https://example.com/test.png" /> ';
  let parser = new Parser(html);
  let parsedHtml = parser.parse();

  let htmlAtJSON = new AtJSON({
    content: html,
    contentType: 'text/html',
    annotations: parsedHtml
  });

  let hir = new HIR(htmlAtJSON).toJSON();
  assert.deepEqual(hir, {
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
