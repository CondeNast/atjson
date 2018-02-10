import { Annotation } from '@atjson/document';
import { HIRNode } from '@atjson/hir';
import schema from './schema';

describe('@atjson/hir/hir-node', function () {

  it('insert sibling simple case works', function () {
    let root = new HIRNode({ type: 'root', start: 0, end: 10 }, schema);
    root.insertAnnotation({ type: 'test', start: 0, end: 5 });
    root.insertAnnotation({ type: 'test', start: 5, end: 10 });

    expect(root.toJSON()).toEqual({ type: 'root', attributes: undefined, children: [
      { type: 'test', children: [], attributes: undefined },
      { type: 'test', children: [], attributes: undefined }
    ] });
  });

  it('insert child simple case works', function () {
    let root = new HIRNode({ type: 'root', start: 0, end: 10 }, schema);
    root.insertAnnotation({ type: 'test', start: 0, end: 5 });

    expect(root.toJSON()).toEqual({ type: 'root', attributes: undefined, children: [
      { type: 'test', children: [], attributes: undefined },
    ] });
  });

  it('insert text simple case works', function () {
    let root = new HIRNode({ type: 'root', start: 0, end: 10 }, schema);
    root.insertAnnotation({ type: 'test', start: 0, end: 5 });
    root.insertAnnotation({ type: 'test', start: 5, end: 10 });

    root.insertText('some text.');

    expect(root.toJSON()).toEqual({ type: 'root', attributes: undefined, children: [
      { type: 'test', children: ['some '], attributes: undefined },
      { type: 'test', children: ['text.'], attributes: undefined }
    ] });
  });

  it('insert text nested children case works', function () {
    let root = new HIRNode({ type: 'root', start: 0, end: 10 }, schema);
    root.insertAnnotation({ type: 'a', start: 0, end: 5 });
    root.insertAnnotation({ type: 'b', start: 2, end: 4 });
    root.insertAnnotation({ type: 'c', start: 5, end: 10 });

    root.insertText('some text.');

    expect(root.toJSON()).toEqual({ type: 'root', attributes: undefined, children: [
      { type: 'a', children: [ 'so',
        { type: 'b', children: ['me'], attributes: undefined  },
        ' ' ], attributes: undefined },
      { type: 'c', children: ['text.'], attributes: undefined }
    ] });
  });

  it('out-of-order insertion of different rank nodes works', function () {
    let root = new HIRNode({ type: 'root', start: 0, end: 10 }, schema);
    root.insertAnnotation({ type: 'ordered-list', start: 4, end: 8 });
    root.insertAnnotation({ type: 'paragraph', start: 0, end: 4 });
    root.insertAnnotation({ type: 'paragraph', start: 4, end: 8 });
    root.insertAnnotation({ type: 'paragraph', start: 8, end: 10 });

    root.insertText('ab\n\nli\n\ncd');

    expect(root.toJSON()).toEqual({ type: 'root', attributes: undefined, children: [
      { type: 'paragraph', children: ['ab\n\n'], attributes: undefined },
      { type: 'ordered-list', attributes: undefined, children: [
        { type: 'paragraph', children: ['li\n\n'], attributes: undefined }
      ]},
      { type: 'paragraph', children: ['cd'], attributes: undefined }
    ]});
  });

  it('insert paragraph after bold works', function () {
    let root = new HIRNode({ type: 'root', start: 0, end: 10 }, schema);
    root.insertAnnotation({ type: 'bold', start: 4, end: 6 });
    root.insertAnnotation({ type: 'paragraph', start: 0, end: 10 });

    root.insertText('abcdefghij');

    expect(root.toJSON()).toEqual({type: 'root', attributes: undefined, children: [
      { type: 'paragraph', children: [
        'abcd',
        { type: 'bold', children: ['ef'], attributes: undefined },
        'ghij'], attributes: undefined }
    ]});
  });

  it('correctly inserts zero-length elements at boundaries', function () {
    let root = new HIRNode({ type: 'root', start: 0, end: 3 }, schema);
    root.insertAnnotation({ type: 'paragraph', start: 0, end: 3 });
    root.insertAnnotation({ type: 'image', start: 3, end: 3 });

    root.insertText('abc');

    expect(root.toJSON()).toEqual(
      { type: 'root', attributes: undefined,
        children: [
          { type: 'paragraph',
            attributes: undefined,
            children: [
              "abc",
              { type: 'image', attributes: undefined, children: [] }
            ]
          }
        ]
      }
  });

});

