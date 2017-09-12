import { module, test, TestCase, QUnitAssert } from './support';
import { Parser } from 'atjson-contenttype-markdown';
import { Annotation } from 'atjson';

@module('markdown -> atjson')
export class MarkdownToAtJSONTest extends TestCase {
  @test
  "Correctly obtains annotations for simple inline elements"(assert: QUnitAssert) {
    let markdown = "*hello* __world__";
    let expectedAnnotations = [
      { type: 'parse-token', tokenType: 'em_open', tag: 'em', start: 0, end: 1 },
      { type: 'em', start: 1, end: 6 },
      { type: 'parse-token', tokenType: 'em_close', tag: 'em', start: 6, end: 7 },
      { type: 'parse-element', tag: 'em', start: 0, end: 7 },

      { type: 'parse-token', tokenType: 'strong_open', tag: 'strong', start: 8, end: 10 },
      { type: 'strong', start: 10, end: 15 },
      { type: 'parse-token', tokenType: 'strong_close', tag: 'strong', start: 15, end: 17 },
      { type: 'parse-element', tag: 'strong', start: 8, end: 17 },

      { type: 'paragraph', start: 0, end: 17 },
      { type: 'parse-element', tag: 'paragraph', start: 0, end: 17 },
    ];

    let parser = new Parser(markdown);
    assert.deepEqual(parser.parse(), expectedAnnotations);
  }

  @test
  "Correctly handles multiple paragraphs"(assert: QUnitAssert) {
    let markdown = "12345\n\n\n678\n910\n\neleventwelve\n\n";
    let mi = markdown.indexOf.bind(markdown);
    let pe = 'parse-element';
    let pg = 'paragraph';
    let a = (t: string, s: number, e: number, tag?: string): Annotation => {
      let v = { type: t, start: s, end: e };
      if (tag) {
        v.tag = tag;
      }
      return v;
    };

    let expectedAnnotations = [
      a(pg,   0,           mi('5') + 1),
      a(pe,   0,           mi('6'), pg),
      a('br', mi('8') + 1, mi('9')),
      a(pg,   mi('6'),     mi('e') - 2),
      a(pe,   mi('6'),     mi('e'), pg),
      a(pg,   mi('e'),     markdown.length - 2),
      a(pe,   mi('e'),     markdown.length, pg)
    ]

    let parser = new Parser(markdown);
    assert.deepEqual(parser.parse(), expectedAnnotations);
  }
}
