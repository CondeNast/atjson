import { module, test, TestCase, QUnitAssert } from './support';
import { AtJSON } from '@atjson/core';

@module("atjson insertText")
export class AtJSONInsertTextTest extends TestCase {
  @test
  "insert text adds text to the content attribute"(assert: QUnitAssert) {
    let atjson = new AtJSON("Hello");
    atjson.insertText(5, " world.");
    assert.equal(atjson.content, "Hello world.");
  }

  @test
  "insert text before an annotation moves it forward"(assert: QUnitAssert) {
    let atjson = new AtJSON({content: "abcd", annotations: [{type: 'bc', start: 1, end: 3}]});
    atjson.insertText(0, 'zzz');
    assert.equal(atjson.content, 'zzzabcd');
    assert.deepEqual(atjson.annotations[0], {type: 'bc', start: 4, end: 6});
  }

  @test
  "insert text after an annotation doesn't affect it"(assert: QUnitAssert) {
    let atjson = new AtJSON({content: "abcd", annotations: [{type: 'ab', start: 0, end: 2}]});
    atjson.insertText(3, 'zzz');
    assert.equal(atjson.content, 'abczzzd');
    assert.deepEqual(atjson.annotations[0], {type: 'ab', start: 0, end: 2});
  }

  @test
  "insert text inside an annotation adjusts the endpoint"(assert: QUnitAssert) {
    let atjson = new AtJSON({
      content: "abcd",
      annotations: [ { type: 'bc', start: 1, end: 3 } ]
    });
    atjson.insertText(2, 'xyz');
    assert.equal(atjson.content, 'abxyzcd');
    assert.deepEqual({type: 'bc', start: 1, end: 6}, atjson.annotations[0]);
  }

  @test
  "insert text at the left boundary of an annotation"(assert: QUnitAssert) {
    let atjson = new AtJSON({content: "abcd", annotations: [{type: 'ab', start: 0, end: 2}]});
    atjson.insertText(0, 'zzz');
    assert.equal(atjson.content, 'zzzabcd');
    assert.deepEqual(atjson.annotations[0], {type: 'ab', start: 3, end: 5});
  }

  @test
  "insert text at the right boundary of an annotation"(assert: QUnitAssert) {
    let atjson = new AtJSON({content: "abcd", annotations: [{type: 'ab', start: 0, end: 2}]});
    atjson.insertText(2, 'zzz');
    assert.equal(atjson.content, 'abzzzcd');
    assert.deepEqual(atjson.annotations[0], {type: 'ab', start: 0, end: 5});
  }

  @test
  "insert text at the boundary of two adjacent annotations ..."(assert: QUnitAssert) {
    let atjson = new AtJSON({
      content: "ac",
      annotations: [
        {type: 'a', start: 0, end: 1},
        {type: 'c', start: 1, end: 2}
      ]
    });

    atjson.insertText(1, 'b');

    assert.equal(atjson.content, 'abc');
    assert.deepEqual(atjson.annotations, [
      { type: 'a', start: 0, end: 2 },
      { type: 'c', start: 2, end: 3 }
    ]);
  }

  @test
  "insert text at the left boundary of an annotation preserving boundaries"(assert: QUnitAssert) {
    let atjson = new AtJSON({content: "abcd", annotations: [{type: 'ab', start: 0, end: 2}]});
    atjson.insertText(0, 'zzz', true);
    assert.equal(atjson.content, 'zzzabcd');
    assert.deepEqual(atjson.annotations[0], {type: 'ab', start: 0, end: 5});
  }

  @test
  "insert text at the right boundary of an annotation preserving boundaries"(assert: QUnitAssert) {
    let atjson = new AtJSON({content: "abcd", annotations: [{type: 'ab', start: 0, end: 2}]});
    atjson.insertText(2, 'zzz', true);
    assert.equal(atjson.content, 'abzzzcd');
    assert.deepEqual(atjson.annotations[0], {type: 'ab', start: 0, end: 2});
  }

  @test
  "insert text at the boundary of two adjacent annotations preserving boundaries"(assert: QUnitAssert) {
    let atjson = new AtJSON({
      content: "ac",
      annotations: [
        {type: 'a', start: 0, end: 1},
        {type: 'c', start: 1, end: 2}
      ]
    });

    atjson.insertText(1, 'b', true);

    assert.equal(atjson.content, 'abc');
    assert.deepEqual(atjson.annotations, [
      { type: 'a', start: 0, end: 1 },
      { type: 'c', start: 1, end: 3 }
    ]);
  }

  @test
  "insert text at the boundary with a custom transform"(assert: QUnitAssert) {
    let atjson = new AtJSON({content: "abcd", annotations: [
      { type: 'ab', start: 0, end: 2,
        transform: (annotation, content, position, length, preserveAdjacentBoundaries): void => {
          assert.equal(annotation.start, 0);
          assert.equal(annotation.end, 2);
          assert.equal(content, 'abzzzcd');
          assert.equal(position, 2);
          assert.equal(length, 3);
          assert.equal(preserveAdjacentBoundaries, false);

          // artificial adjustment
          annotation.start = 1;
          annotation.end = 3;
        }
      }
    ]});

    atjson.insertText(2, 'zzz');
    assert.equal(atjson.content, 'abzzzcd');
    assert.equal(atjson.annotations[0].start, 1);
    assert.equal(atjson.annotations[0].end, 3);
  }

}
