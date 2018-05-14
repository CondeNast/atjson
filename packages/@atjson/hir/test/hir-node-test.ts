import { Annotation, Schema } from '@atjson/document';
import { HIRNode } from '../src/index';
import schema from './schema';
import { bold, document, image, li, node, ol, paragraph } from './utils';

let test = node('test');
let a = node('a');
let b = node('b');
let c = node('c');

describe('@atjson/hir/hir-node', () => {

  it('insert sibling simple case works', () => {
    let hir = new HIRNode({ type: 'root', start: 0, end: 10 }, schema as Schema);
    hir.insertAnnotation({ type: 'test', start: 0, end: 5 });
    hir.insertAnnotation({ type: 'test', start: 5, end: 10 });

    expect(hir.toJSON()).toEqual(
      document(
        test(),
        test()
      )
    );
  });

  it('insert child simple case works', () => {
    let hir = new HIRNode({ type: 'root', start: 0, end: 10 }, schema as Schema);
    hir.insertAnnotation({ type: 'test', start: 0, end: 5 });

    expect(hir.toJSON()).toEqual(document(test()));
  });

  it('insert text simple case works', () => {
    let hir = new HIRNode({ type: 'root', start: 0, end: 10 }, schema as Schema);
    hir.insertAnnotation({ type: 'test', start: 0, end: 5 });
    hir.insertAnnotation({ type: 'test', start: 5, end: 10 });

    hir.insertText('some text.');

    expect(hir.toJSON()).toEqual(
      document(
        test('some '),
        test('text.')
      )
    );
  });

  it('insert text nested children case works', () => {
    let hir = new HIRNode({ type: 'root', start: 0, end: 10 }, schema as Schema);
    hir.insertAnnotation({ type: 'a', start: 0, end: 5 });
    hir.insertAnnotation({ type: 'b', start: 2, end: 4 });
    hir.insertAnnotation({ type: 'c', start: 5, end: 10 });

    hir.insertText('some text.');

    expect(hir.toJSON()).toEqual(
      document(
        a('so', b('me'), ' '),
        c('text.')
      )
    );
  });

  it('out-of-order insertion of different rank nodes works', () => {
    let hir = new HIRNode({ type: 'root', start: 0, end: 10 }, schema as Schema);
    hir.insertAnnotation({ type: 'paragraph', start: 4, end: 8 });
    hir.insertAnnotation({ type: 'ordered-list', start: 4, end: 8 });
    hir.insertAnnotation({ type: 'paragraph', start: 8, end: 10 });
    hir.insertAnnotation({ type: 'list-item', start: 4, end: 8 });
    hir.insertAnnotation({ type: 'paragraph', start: 0, end: 4 });

    hir.insertText('ab\n\nli\n\ncd');

    expect(hir.toJSON()).toEqual(
      document(
        paragraph('ab\n\n'),
        ol(
          li(
            paragraph('li\n\n')
          )
        ),
        paragraph('cd')
      )
    );
  });

  it('insert paragraph after bold works', () => {
    let hir = new HIRNode({ type: 'root', start: 0, end: 10 }, schema as Schema);
    hir.insertAnnotation({ type: 'bold', start: 4, end: 6 });
    hir.insertAnnotation({ type: 'paragraph', start: 0, end: 10 });

    hir.insertText('abcdefghij');

    expect(hir.toJSON()).toEqual(
      document(
        paragraph('abcd', bold('ef'), 'ghij')
      )
    );
  });

  it('annotations can override display properties', () => {
    let hir = new HIRNode({ type: 'root', start: 0, end: 10 }, schema as Schema);
    hir.insertAnnotation({ type: 'b', display: 'inline', start: 0, end: 1 });
    hir.insertAnnotation({ type: 'c', display: 'object', start: 0, end: 1 });
    hir.insertAnnotation({ type: 'a', display: 'block', start: 0, end: 1 });

    expect(hir.toJSON()).toEqual(
      document(
        a(b(c()))
      )
    );
  });

  it('correctly inserts zero-length elements at boundaries', () => {
    let hir = new HIRNode({ type: 'root', start: 0, end: 3 }, schema as Schema);
    hir.insertAnnotation({ type: 'paragraph', start: 0, end: 3 });
    hir.insertAnnotation({ type: 'image', start: 3, end: 3 });

    hir.insertText('abc');

    expect(hir.toJSON()).toEqual(
      document(
        paragraph(
          'abc',
          image()
        )
      )
    );
  });

});
