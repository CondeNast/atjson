import { Parser } from '@atjson/contenttype-html';
import { Annotation, AtJSON } from '@atjson/core';
import PlainTextRenderer from '@atjson/plain-text-renderer';

QUnit.module('PlainTextRenderer');

QUnit.test('it returns the text from the atjson document', assert => {
  let renderer = new PlainTextRenderer();
  let annotations: Annotation[] = [{
      type: 'atjson',
      start: 0,
      end: 5,
      attributes: {
        contentType: 'text/plain',
        content: 'Call me Ishmael',
        annotations: []
      }
    }];

  let document = new AtJSON({
    content: '☎️👨🏻⛵️🐳👌🏼',
    contentType: 'text/plain',
    annotations
  });
  let text = renderer.render(document);
  assert.equal(text, '☎️👨🏻⛵️🐳👌🏼');
});

QUnit.test('it strips virtual annotations', assert => {
  let html = '<p>This is some <em>fancy</em> <span class="fancy">text</span>.';
  let parser = new Parser(html);
  let parsedHTML = parser.parse();

  let document = new AtJSON({
    content: html,
    contentType: 'text/html',
    annotations: parsedHTML
  });

  let renderer = new PlainTextRenderer();
  let text = renderer.render(document);
  assert.equal(text, 'This is some fancy text.');
});
