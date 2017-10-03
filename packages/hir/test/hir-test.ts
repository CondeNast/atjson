import { Annotation, AtJSON } from '@atjson/core';
import { HIR } from '../src/index';

type node = {
  type: string;
  attributes: any;
  children: node[];
}|string;

// HIR test helpers for quickly generating JSON for
// the JSON output
function root(...children: node[]) {
  return {
    type: 'root',
    attributes: undefined,
    children
  };
}

function bold(...children: node[]) {
  return {
    type: 'bold',
    attributes: undefined,
    children
  };
}

function italic(...children: node[]) {
  return {
    type: 'italic',
    attributes: undefined,
    children
  };
}

function ol(...children: node[]) {
  return {
    type: 'ordered-list',
    attributes: undefined,
    children
  };
}

function ul(...children: node[]) {
  return {
    type: 'unordered-list',
    attributes: undefined,
    children
  };
}

function li(...children: node[]) {
  return {
    type: 'list-item',
    attributes: undefined,
    children
  };
}

function paragraph(...children: node[]) {
  return {
    type: 'paragraph',
    attributes: undefined,
    children
  };
}

describe('@atjson/hir', function () {

  /**
   * FIXME I don't know how to test types. This just throws in compile time,
   * but we should test that invalid objects are in fact caught by the compiler. ???
   *
  it('rejects invalid documents', function () {
    let invalidDoc = { blah: 'x' };
    expect(() => new HIR(invalidDoc)).toThrow();
  });
   */

  it('accepts atjson-shaped object', function () {
    let validDoc = new AtJSON ({
      content: 'test\ndocument\n\nnew paragraph',
      annotations: []
    });

    let expected = root('test\ndocument\n\nnew paragraph');
    expect(new HIR(validDoc)).toBeDefined();
    expect(new HIR(validDoc).toJSON()).toEqual(expected);
  });

  it('accepts a bare string', function () {
    let expected = root('Look at this huge string');

    expect(new HIR('Look at this huge string')).toBeDefined();
    expect(new HIR('Look at this huge string').toJSON()).toEqual(expected);
  });

  describe('constructs a valid hierarchy', function () {

    it('from a document without nesting', function () {
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

      expect(hir).toEqual(expected);
    });

    it('from a document with nesting', function () {
      let nested = new AtJSON({
        content: 'I have a list:\n\nFirst item plus bold text\n\n' +
                 'Second item plus italic text\n\nItem 2a\n\nItem 2b\n\nAfter all the lists',
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

      expect((new HIR(nested).toJSON()).toEqual(expected);
    });

    it('from a document with overlapping annotations at the same level', function () {
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

      expect(new HIR(overlapping).toJSON()).toEqual(expected);
    });

    it('from a document with overlapping annotations across heirarchical levels', function () {
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

        expect(new HIR(spanning).toJSON()).toEqual(expected);
    });
  });
});
