import { InlineAnnotation } from '@atjson/document';
import { HIRNode, RootAnnotation } from '../src';
import { Blockquote, Bold, Image, ListItem, OrderedList, Paragraph } from './test-source';
import { blockquote, bold, document, image, li, node, ol, paragraph } from './utils';

class TestAnnotation extends InlineAnnotation {
  static vendorPrefix = 'test';
  static type = 'test';
}

class A extends InlineAnnotation {
  static vendorPrefix = 'test';
  static type = 'a';
}

class B extends InlineAnnotation {
  static vendorPrefix = 'test';
  static type = 'b';
}

class C extends InlineAnnotation {
  static vendorPrefix = 'test';
  static type = 'c';
}

let test = node('test');
let a = node('a');
let b = node('b');
let c = node('c');

describe('@atjson/hir/hir-node', () => {
  it('insert sibling simple case works', () => {
    let hir = new HIRNode(new RootAnnotation({ start: 0, end: 10, attributes: {} }));
    hir.insertAnnotation(new TestAnnotation({ start: 0, end: 5, attributes: {} }));
    hir.insertAnnotation(new TestAnnotation({ start: 5, end: 10, attributes: {} }));

    expect(hir.toJSON()).toEqual(
      document(
        test(),
        test()
      )
    );
  });

  it('insert child simple case works', () => {
    let hir = new HIRNode(new RootAnnotation({ start: 0, end: 10, attributes: {} }));
    hir.insertAnnotation(new TestAnnotation({ start: 0, end: 5, attributes: {} }));

    expect(hir.toJSON()).toEqual(document(test()));
  });

  it('insert text simple case works', () => {
    let hir = new HIRNode(new RootAnnotation({ start: 0, end: 10, attributes: {} }));
    hir.insertAnnotation(new TestAnnotation({ start: 0, end: 5, attributes: {} }));
    hir.insertAnnotation(new TestAnnotation({ start: 5, end: 10, attributes: {} }));

    hir.insertText('some text.');

    expect(hir.toJSON()).toEqual(
      document(
        test('some '),
        test('text.')
      )
    );
  });

  it('insert text nested children case works', () => {
    let hir = new HIRNode(new RootAnnotation({ start: 0, end: 10, attributes: {} }));
    hir.insertAnnotation(new A({ start: 0, end: 5, attributes: {} }));
    hir.insertAnnotation(new B({ start: 2, end: 4, attributes: {} }));
    hir.insertAnnotation(new C({ start: 5, end: 10, attributes: {} }));

    hir.insertText('some text.');

    expect(hir.toJSON()).toEqual(
      document(
        a('so', b('me'), ' '),
        c('text.')
      )
    );
  });

  it('out-of-order insertion of different rank nodes works', () => {
    let hir = new HIRNode(new RootAnnotation({ start: 0, end: 10, attributes: {} }));
    hir.insertAnnotation(new Paragraph({ start: 4, end: 8, attributes: {} }));
    hir.insertAnnotation(new OrderedList({ start: 4, end: 8, attributes: {} }));
    hir.insertAnnotation(new Paragraph({ start: 8, end: 10, attributes: {} }));
    hir.insertAnnotation(new ListItem({ start: 4, end: 8, attributes: {} }));
    hir.insertAnnotation(new Paragraph({ start: 0, end: 4, attributes: {} }));

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
    let hir = new HIRNode(new RootAnnotation({ start: 0, end: 10, attributes: {} }));
    hir.insertAnnotation(new Bold({ start: 4, end: 6, attributes: {} }));
    hir.insertAnnotation(new Paragraph({ start: 0, end: 10, attributes: {} }));

    hir.insertText('abcdefghij');

    expect(hir.toJSON()).toEqual(
      document(
        paragraph('abcd', bold('ef'), 'ghij')
      )
    );
  });

  it('annotations can override display properties', () => {
    let hir = new HIRNode(new RootAnnotation({ start: 0, end: 10, attributes: {} }));
    hir.insertAnnotation(new Bold({ start: 0, end: 1, attributes: {} }));
    hir.insertAnnotation(new Image({ start: 0, end: 1, attributes: {} }));
    hir.insertAnnotation(new Blockquote({ start: 0, end: 1, attributes: {} }));

    expect(hir.toJSON()).toEqual(
      document(
        blockquote(bold(image()))
      )
    );
  });

  it('correctly inserts zero-length elements at boundaries', () => {
    let hir = new HIRNode(new RootAnnotation({ start: 0, end: 3, attributes: {} }));
    hir.insertAnnotation(new Paragraph({ start: 0, end: 3, attributes: {} }));
    hir.insertAnnotation(new Image({ start: 3, end: 3, attributes: {} }));

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
