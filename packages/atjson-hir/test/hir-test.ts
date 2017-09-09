import { module, test, TestCase, QUnitAssert } from './support';
import { HIR } from 'atjson-hir';
import { AtJSON, Annotation } from 'atjson';

@module("hir")
export class HIRTest extends TestCase {

  /*
   * FIXME I don't know how to test types. This just throws in compile time,
   * but we should test that invalid objects are in fact caught by the compiler. ???
   *
  @test
  "rejects invalid documents"(assert: QUnitAssert) {
    let invalidDoc = { blah: 'x' };
    assert.raises(() => new HIR(invalidDoc));
  }
   */

  @test
  "accepts atjson-shaped object"(assert: QUnitAssert) {
    let validDoc = new AtJSON ({
      content: 'test\ndocument\n\nnew paragraph',
      annotations: []
    });

    let expected = {
      type: 'root',
      children: [
        { type: 'paragraph', children: [ 'test\ndocument'] },
        { type: 'paragraph', children: ['new paragraph'] }
      ]
    };

    assert.ok(new HIR(validDoc));
    assert.deepEqual(new HIR(validDoc).toJSON(), expected);
  }

  @test
  "accepts a bare string"(assert: QUnitAssert) {
    let expected = {
      type: 'root',
      children: [{
        type: "paragraph",
        children: [ 'Look at this huge string' ]
      }]
    };

    assert.ok(new HIR("Look at this huge string"));
    assert.deepEqual(new HIR("Look at this huge string").toJSON(), expected);
  }

  @test
  "constructs a valid heirarchy from a document without nesting"(assert: QUnitAssert) {
    let noNesting = new AtJSON({
      content: 'A string with a bold and an italic annotation',
      annotations: [
        { type: 'bold', start: 16, end: 20 },
        { type: 'italic', start: 28, end: 34 }
      ]
    });

    let hir = new HIR(noNesting).toJSON();
    let expected = { type: 'root', children: [{
      type: 'paragraph',
      children: [
        'A string with a ',
        {
          type: 'bold',
          children: [ 'bold' ]
        },
        ' and an ',
        {
          type: 'italic',
          children: [ 'italic' ]
        },
        ' annotation'
      ]
    }]};

    assert.deepEqual(hir, expected);
  }

  @test
  "constructs a valid heirarchy from a document with nesting"(assert: QUnitAssert) {
    let nested = new AtJSON({
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

    let expected = 
      { type: 'root',
        children: [
          { type: 'paragraph', children: [ 'I have a list:' ] },
          { type: 'ordered-list', children: [
            { type: 'list-item', children: [
              { type: 'paragraph', children: [
                'First item plus ',
                { type: 'bold', children: ['bold'] },
                ' text'
              ] }
            ] },
            { type: 'list-item', children: [
              { type: 'paragraph', children: [
                'Second item plus ',
                { type: 'italic', children: ['italic'] },
                ' text',
             ]},
             {type: 'ordered-list', children: [
               { type: 'list-item', children: [
                 { type: 'paragraph', children: [
                   'Item 2a',
                 ] }
               ]},
               { type: 'list-item', children: [
                 { type: 'paragraph', children: [
                   'Item 2b',
                 ] }
               ]}
             ]}
           ]}
          ]},
          { type: 'paragraph', children: ['After all the lists'] }
        ]
      };

    assert.deepEqual(new HIR(nested).toJSON(), expected);
  }

  @test
  "constructs a valid heirarchy from a document with overlapping annotations at the same level"(assert: QUnitAssert) {
    let overlapping = new AtJSON({
      content: 'Some text that is both bold and italic plus something after.',
      annotations: [
        { type: 'bold', start: 23, end: 31 },
        { type: 'italic', start: 28, end: 38 }
      ]
    });

    let expected = { type: 'root',
      children: [{
        type: 'paragraph',
        children: [
          'Some text that is both ',
          { type: 'bold', children: [
            'bold ', { type: 'italic', children: ['and'] }
          ]},
          { type: 'italic', children: [' italic'] },
          ' plus something after.'
        ]
      }]
    };

    assert.deepEqual(new HIR(overlapping).toJSON(), expected);
  }

  @test
  "constructs a valid heirarchy from a document with overlapping annotations across heirarchical levels"(assert: QUnitAssert) {
    let spanning = new AtJSON({
      content: 'A paragraph with some bold\n\ntext that continues into the next.',
      annotations: [
        { type: 'bold', start: 22, end: 32 }
      ]
    });

    let expected = { type: 'root', children: [
      { type: 'paragraph', children: [
        'A paragraph with some ', { type: 'bold', children: ['bold'] }
      ]},
      { type: 'paragraph', children: [
        { type: 'bold', children: ['text'] }, ' that continues into the next.'
      ]}
    ]};

    assert.deepEqual(new HIR(spanning).toJSON(), expected);
  }

  @test
  "throws an error for invalid overlapping annotations"(assert: QUnitAssert) {
    let content = 'My list\n\nitems bring\n\nall the boys\n\nto the yard';
    let invalidOverlaps = new AtJSON({
      content: content,
      annotations: [
        { type: 'ordered-list', start: "My list\n\n".length, end: "My list\n\nitems bring\n\nall the boys\n\n".length },
        { type: 'ordered-list', start: "My list\n\nitems bring\n\n".length, end: content.length }
      ]
    });

    assert.raises(() => new HIR(invalidOverlaps));
  }
}
