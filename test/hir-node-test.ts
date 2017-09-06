import { module, test, TestCase, QUnitAssert } from './support';
import { HIRNode } from 'atjson/hir-node';
import { Annotation } from 'atjson';

@module("hir-node")
export class HIRNodeTest extends TestCase {

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
}
