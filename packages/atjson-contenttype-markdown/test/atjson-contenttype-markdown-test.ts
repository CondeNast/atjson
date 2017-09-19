import { Parser } from 'atjson-contenttype-markdown';
import { QUnitAssert, TestCase, module, test } from './support';

@module('markdown -> atjson')
export class MarkdownToAtJSONTest extends TestCase {
  @test
  'Correctly obtains annotations for simple inline elements'(assert: QUnitAssert) {
    let markdown = '*hello* __world__';
    let expectedAnnotations = [
      { type: 'paragraph', start: 0, end: 11 },
      { type: 'em', start: 0, end: 5 },
      { type: 'strong', start: 6, end: 11 }
    ];

    let parser = new Parser(markdown);
    let atjson = parser.parse();
    assert.deepEqual(atjson.annotations, expectedAnnotations);
  }

  @test
  'Correctly handles multiple paragraphs'(assert: QUnitAssert) {
    let markdown = '12345\n\n\n678\n910\n\neleventwelve\n\n';

    let expectedAnnotations = [
      { type: 'paragraph', start: 0, end: 5 },
      { type: 'paragraph', start: 6, end: 13 },
      { type: 'paragraph', start: 14, end: 26 }
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
      { type: 'paragraph', start: 0, end: 5 },
      { type: 'strong', start: 4, end: 5 }
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
      { type: 'paragraph', start: 0, end: 3 },
      { type: 'code', start: 0, end: 3 }
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
      { type: 'paragraph', start: 0, end: 9 },
      { type: 'code', start: 0, end: 9 }
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
      { type: 'paragraph', start: 0, end: 14 },
      { type: 'a', start: 0, end: 4 },
      { type: 'a', start: 5, end: 9 },
      { type: 'a', start: 10, end: 14 }
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
      { type: 'ordered-list', start: 0, end: c.length - 1 },
      { type: 'list-item', start: 1, end: c.length - 2 },
      { type: 'paragraph', start: 2, end: c.indexOf('nes.') + 4 },
      { type: 'pre', start: c.indexOf('inden'), end: c.indexOf('code\n') + 5 },
      { type: 'code', start: c.indexOf('inden'), end: c.indexOf('code\n') + 5 },
      { type: 'blockquote', start: c.indexOf('\nA block'), end: c.indexOf('quote.\n') + 7 },
      { type: 'paragraph', start: c.indexOf('A block'), end: c.indexOf('quote.') + 6 }
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
    assert.deepEqual(atjson.annotations, [{ type: 'html', start: 0, end: 49 }]);
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
