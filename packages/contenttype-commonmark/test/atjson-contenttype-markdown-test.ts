import { Parser } from '@atjson/contenttype-commonmark';
import { QUnitAssert, TestCase, module, test } from './support';

@module('markdown -> atjson')
export class MarkdownToAtJSONTest extends TestCase {
  @test
  'Correctly obtains annotations for simple inline elements'(assert: QUnitAssert) {
    let markdown = '*hello* __world__';
    let expectedAnnotations = [
      { type: 'paragraph', start: 0, end: 11, attributes: {} },
      { type: 'em', start: 0, end: 5, attributes: {} },
      { type: 'strong', start: 6, end: 11, attributes: {} }
    ];

    let parser = new Parser(markdown);
    let atjson = parser.parse();
    assert.deepEqual(atjson.annotations, expectedAnnotations);
  }

  @test
  'Correctly handles multiple paragraphs'(assert: QUnitAssert) {
    let markdown = '12345\n\n\n678\n910\n\neleventwelve\n\n';

    let expectedAnnotations = [
      { type: 'paragraph', start: 0, end: 5, attributes: {} },
      { type: 'paragraph', start: 6, end: 13, attributes: {} },
      { type: 'paragraph', start: 14, end: 26, attributes: {} }
    ];

    let parser = new Parser(markdown);
    let atjson = parser.parse();
    assert.equal(atjson.content, '12345\n678\n910\neleventwelve\n');
    assert.deepEqual(atjson.annotations, expectedAnnotations);
  }

  @test
  'Correctly handles escape sequences'(assert: QUnitAssert) {
    let markdown = 'foo __\\___';
    let expectedAnnotations = [
      { type: 'paragraph', start: 0, end: 5, attributes: {} },
      { type: 'strong', start: 4, end: 5, attributes: {} }
    ];

    let parser = new Parser(markdown);
    let atjson = parser.parse();

    assert.equal(atjson.content, 'foo _\n');
    assert.deepEqual(atjson.annotations, expectedAnnotations);
  }

  @test
  'Correctly handles simple code spans'(assert: QUnitAssert) {
    let markdown = '`a b`';

    let expectedAnnotations = [
      { type: 'paragraph', start: 0, end: 3, attributes: {} },
      { type: 'code', start: 0, end: 3, attributes: {} }
    ];

    let parser = new Parser(markdown);
    let atjson = parser.parse();

    assert.equal(atjson.content, 'a b\n');
    assert.deepEqual(atjson.annotations, expectedAnnotations);
  }

  @test
  '`` foo ` bar  ``'(assert: QUnitAssert) {
    let markdown = '`` foo ` bar  ``';
    let expectedAnnotations = [
      { type: 'paragraph', start: 0, end: 9, attributes: {} },
      { type: 'code', start: 0, end: 9, attributes: {} }
    ];
    let parser = new Parser(markdown);
    let atjson = parser.parse();
    assert.equal(atjson.content, 'foo ` bar\n');
    assert.deepEqual(atjson.annotations, expectedAnnotations);
  }

  @test
  'links'(assert: QUnitAssert) {
    let markdown = '[link](/url "title")\n[link](/url \'title\')\n[link](/url (title))';
    let expectedAnnotations = [
      { type: 'paragraph', start: 0, end: 14, attributes: {} },
      { type: 'a', start: 0, end: 4, attributes: { href: '/url', title: 'title' } },
      { type: 'a', start: 5, end: 9, attributes: { href: '/url', title: 'title' } },
      { type: 'a', start: 10, end: 14, attributes: { href: '/url', title: 'title' } }
    ];

    let parser = new Parser(markdown);
    let atjson = parser.parse();
    assert.equal(atjson.content, 'link\nlink\nlink\n');
    assert.deepEqual(atjson.annotations, expectedAnnotations);
  }

  @test
  'An ordered list with an embedded blockquote'(assert: QUnitAssert) {

    let markdown = '1.  A paragraph\n    with two lines.\n\n        indented code\n\n    > A block quote.';

    let parser = new Parser(markdown);
    let atjson = parser.parse();

    let c = atjson.content;
    let expectedAnnotations = [
      { type: 'ordered-list', start: 0, end: c.length - 1, attributes: {} },
      { type: 'list-item', start: 1, end: c.length - 2, attributes: {} },
      { type: 'paragraph', start: 2, end: c.indexOf('nes.') + 4, attributes: {} },
      { type: 'pre', start: c.indexOf('inden'), end: c.indexOf('code\n') + 5, attributes: {} },
      { type: 'code', start: c.indexOf('inden'), end: c.indexOf('code\n') + 5, attributes: {} },
      { type: 'blockquote', start: c.indexOf('\nA block'), end: c.indexOf('quote.\n') + 7, attributes: {} },
      { type: 'paragraph', start: c.indexOf('A block'), end: c.indexOf('quote.') + 6, attributes: {} }
    ];

    assert.equal(atjson.content.replace(/\n/g, 'Z'), '\n\nA paragraph\nwith two lines.\nindented code\n\n\nA block quote.\n\n\n\n'.replace(/\n/g, 'Z'));
    assert.deepEqual(atjson.annotations, expectedAnnotations);
  }

  @test
  'html blocks'(assert: QUnitAssert) {
    let markdown = '<DIV CLASS="foo">\n<p><em>Markdown</em></p>\n</DIV>';

    let parser = new Parser(markdown);
    let atjson = parser.parse();

    assert.equal(atjson.content, '<DIV CLASS="foo">\n<p><em>Markdown</em></p>\n</DIV>\n');
    assert.deepEqual(atjson.annotations, [{ type: 'html', start: 0, end: 49, attributes: {} }]);
  }

  @test
  'tabs'(assert: QUnitAssert) {
    let markdown = '\tfoo\tbaz\t\tbim';

    let parser = new Parser(markdown);
    let atjson = parser.parse();

    assert.equal(atjson.content, 'foo\tbaz\t\tbim\n');
  }

  @test
  'hr'(assert: QUnitAssert) {
    let markdown = '*\t*\t*\t\n';

    let parser = new Parser(markdown);
    let atjson = parser.parse();

    assert.equal(atjson.content, '\n');
  }
}
