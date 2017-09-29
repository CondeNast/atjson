import { module, test, TestCase, QUnitAssert } from './support';
import { HIR } from '@atjson/hir';
import { AtJSON, Annotation } from '@atjson/core';

// HIR test helpers for quickly generating JSON for
// the JSON output
function root(...children) {
  return {
    type: 'root',
    attributes: undefined,
    children
  };
}

function bold(...children) {
  return {
    type: 'bold',
    attributes: undefined,
    children
  };
}

function italic(...children) {
  return {
    type: 'italic',
    attributes: undefined,
    children
  };
}

function ol(...children) {
  return {
    type: 'ordered-list',
    attributes: undefined,
    children
  };
}

function ul(...children) {
  return {
    type: 'unordered-list',
    attributes: undefined,
    children
  };
}

function li(...children) {
  return {
    type: 'list-item',
    attributes: undefined,
    children
  };
}

function paragraph(...children) {
  return {
    type: 'paragraph',
    attributes: undefined,
    children
  };
}

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

    let expected = root('test\ndocument\n\nnew paragraph');
    assert.ok(new HIR(validDoc));
    assert.deepEqual(new HIR(validDoc).toJSON(), expected);
  }

  @test
  "accepts a bare string"(assert: QUnitAssert) {
    let expected = root('Look at this huge string');

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
    let expected = root(
      'A string with a ',
      bold('bold'),
      ' and an ',
      italic('italic'),
      ' annotation'
    );

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

    let expected = root(
      'I have a list:\n\n',
      ol(
        li('First item plus ', bold('bold'), ' text\n\n'),
        li('Second item plus ', italic('italic'), ' text\n\n',
          ol(
            li('Item 2a\n\n'),
            li('Item 2b\n\n')
          )
        )
      ),
      'After all the lists'
    );

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

    let expected = root(
      'Some text that is both ',
      bold('bold ', italic('and')),
      italic(' italic'),
      ' plus something after.'
    );

    assert.deepEqual(new HIR(overlapping).toJSON(), expected);
  }

  @test
  "constructs a valid heirarchy from a document with overlapping annotations across heirarchical levels"(assert: QUnitAssert) {
    let spanning = new AtJSON({
      content: 'A paragraph with some bold\n\ntext that continues into the next.',
      annotations: [
        { type: 'paragraph', start: 0, end: 28 },
        { type: 'paragraph', start: 28, end: 62 },
        { type: 'bold', start: 22, end: 32 }
      ]
    });

    let expected = root(
      paragraph(
        'A paragraph with some ',
        bold('bold\n\n'),
      ),
      paragraph(
        bold('text'),
        ' that continues into the next.'
      )
    );

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
