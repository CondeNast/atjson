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
        attributes: undefined,
        children: [{
          type: 'code',
          attributes: undefined,
          children: [ 'this ', { type: 'b', attributes: undefined, children: ['is'] }, ' a test' ]
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
      attributes: undefined,
      children: [
        'aaa', { type: 'br', attributes: undefined, children: [] }, '\nbbb'
      ]
    }]
  });
});
