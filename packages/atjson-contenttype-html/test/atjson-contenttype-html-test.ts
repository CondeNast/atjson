import { AtJSON } from 'atjson';
import { Parser } from 'atjson-contenttype-html';
import { HIR } from 'atjson-hir';

QUnit.module('atjson-contenttype-html tests');

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
    children: [
      { type: 'pre',
        children: [{
          type: 'code',
          children: [ 'this ', { type: 'b', children: ['is'] }, ' a test' ]
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
    children: [
      { type: 'paragraph',
        children: [
          'aaa', { type: 'br', children: [] }, '\nbbb'
        ]
      }
    ]
  });
});
