import { module, test, TestCase, QUnitAssert } from './support';
import { HIRNode } from 'atjson/hir-node';
import { Annotation } from 'atjson';

@module("hir-node")
export class HIRNodeTest extends TestCase {

  @test
  "insert sibling simple case works"(assert: QUnitAssert) {
    let root = new HIRNode({type: 'root', start: 0, end: 10})
    let node = new HIRNode({ type: 'test', start: 0, end: 5});
    let sibling = new HIRNode({ type: 'test', start: 5, end: 10});

    root.insertNode(node);
    root.insertNode(sibling);

    assert.deepEqual(root.toJSON(), { type: 'root', children: [
      { type: 'test', children: [] },
      { type: 'test', children: [] }
    ] })
  }

  @test
  "insert child simple case works"(assert: QUnitAssert) {
    let root = new HIRNode({type: 'root', start: 0, end: 10})
    let node = new HIRNode({ type: 'test', start: 0, end: 5});

    root.insertNode(node);

    assert.deepEqual(root.toJSON(), { type: 'root', children: [
      { type: 'test', children: [] },
    ] })
  }

  @test
  "insert text simple case works"(assert: QUnitAssert) {
    let root = new HIRNode({type: 'root', start: 0, end: 10})
    let node = new HIRNode({ type: 'test', start: 0, end: 5});
    let sibling = new HIRNode({ type: 'test', start: 5, end: 10});

    root.insertNode(node);
    root.insertNode(sibling);
    root.insertText('some text.');

    assert.deepEqual(root.toJSON(), { type: 'root', children: [
      { type: 'test', children: ['some '] },
      { type: 'test', children: ['text.'] }
    ] })
  }

  @test
  "insert text nested children case works"(assert: QUnitAssert) {
    let root    = new HIRNode({type: 'root', start: 0, end: 10});
    let node    = new HIRNode({type: 'a', start: 0, end: 5});
    let child   = new HIRNode({type: 'b', start: 2, end: 4});
    let sibling = new HIRNode({type: 'c', start: 5, end: 10});

    root.insertNode(node);
    root.insertNode(child);
    root.insertNode(sibling);
    root.insertText('some text.');

    assert.deepEqual(root.toJSON(), { type: 'root', children: [
      { type: 'a', children: [ 'so', { type: 'b', children: ['me'] }, ' ' ] },
      { type: 'c', children: ['text.'] }
    ] })
  }

  @test
  "out-of-order insertion of different rank nodes works"(assert: QUnitAssert) {
    let root = new HIRNode({ type: 'root', start: 0, end: 10 });
    let block = new HIRNode({type: 'ordered-list', start: 4, end: 8});
    let paragraphOne = new HIRNode({type: 'paragraph', start: 0, end: 4});
    let paragraphTwo = new HIRNode({type: 'paragraph', start: 4, end: 8});
    let paragraphThree = new HIRNode({type: 'paragraph', start: 8, end: 10});

    root.insertNode(block);
    root.insertNode(paragraphOne);
    root.insertNode(paragraphTwo);
    root.insertNode(paragraphThree);

    root.insertText('ab\n\nli\n\ncd');

    assert.deepEqual(root.toJSON(), { type: 'root', children: [
      { type: 'paragraph', children: ['ab\n\n'] },
      { type: 'ordered-list', children: [
        { type: 'paragraph', children: ['li\n\n'] }
      ]},
      { type: 'paragraph', children: ['cd'] }
    ]});
  }

  @test
  "insert paragraph after bold works"(assert: QUnitAssert) {
    let root = new HIRNode({type:'root', start: 0, end: 10});
    let bold = new HIRNode({type:'bold', start: 4, end: 6});
    let paragraph = new HIRNode({type:'paragraph', start:0, end: 10});
    root.insertNode(bold);
    root.insertNode(paragraph);
    root.insertText('abcdefghij');

    assert.deepEqual(root.toJSON(), {type:'root', children: [
      { type: 'paragraph', children: [ 'abcd', { type: 'bold', children: ['ef']}, 'ghij']}
    ]});
  }

    /*
  @test
  "insert annotation contained within the node returns void"(assert: QUnitAssert) {
    let node = new HIRNode({ type: 'test', start: 5, end: 10 });
    let annotation = { type: 'bold', start: 6, end: 9 } as Annotation;

    assert.equal(node.insertAnnotation(annotation), undefined);
  };

  @test
  "insert annotation partially contained within the node returns a trimmed annotation"(assert: QUnitAssert) {
    let node = new HIRNode({ type: 'test', start: 5, end: 10 });
    let annotation: Annotation = { type: 'bold', start: 8, end: 15 };

    let expectedResult: Annotation = { type: 'bold', start: 10, end: 15 };

    assert.deepEqual(node.insertAnnotation(annotation), expectedResult);
  };

  @test
  "insert annotation not contained within the node (starts after) returns the original annotation"(assert: QUnitAssert) {
    let node = new HIRNode({ type: 'test', start: 0, end: 5 });
    let annotation: Annotation = { type: 'bold', start: 8, end: 10 };

    assert.deepEqual(node.insertAnnotation(annotation), annotation);
  }

  @test
  "insert annotation not contained within the node (starts before) throws an error"(assert: QUnitAssert) {
    let node = new HIRNode({ type: 'test', start: 10, end: 15 });
    let annotation: Annotation = { type: 'bold', start: 3, end: 6 };

    assert.raises(() => node.insertAnnotation(annotation));
  }
     */
}
