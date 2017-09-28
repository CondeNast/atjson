import TextRenderer from '@atjson/text-renderer';
import { Parser } from '@atjson/contenttype-html';
import { AtJSON, Annotation } from '@atjson/core';
import { HIR } from '@atjson/hir';

QUnit.module('TextRenderer');

QUnit.test('it returns the text from the atjson document', function (assert) {
  let renderer = new TextRenderer();
  let document = new AtJSON({
    content: '☎️👨🏻⛵️🐳👌🏼',
    contentType: 'text/plain',
    annotations: [{
      start: 0,
      end: 5,
      type: 'atjson',
      attributes: {
        contentType: 'text/plain',
        content: 'Call me Ishmael',
        annotations: []
      }
    }]
  });
  let text = renderer.render(new HIR(document));
  assert.equal(text, '☎️👨🏻⛵️🐳👌🏼');
});

QUnit.test('it strips virtual annotations', function (assert) {
  let html = '<p>This is some <em>fancy</em> <span class="fancy">text</span>.';
  let parser = new Parser(html);
  let parsedHTML = parser.parse();

  let document = new AtJSON({
    content: html,
    contentType: 'text/html',
    annotations: parsedHTML
  });

  let renderer = new TextRenderer();
  let text = renderer.render(new HIR(document));
  assert.equal(text, 'This is some fancy text.');
});
