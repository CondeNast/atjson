import { AtJSON } from '@atjson/core';
import { QUnitAssert, TestCase, module, test } from './support';

@module('atjson')
export class AtJSONTest extends TestCase {
  @test
  'constructor accepts a string'(assert: QUnitAssert) {
    assert.ok(new AtJSON('Hello World.'));
  }

  @test
  'constructor accepts an object'(assert: QUnitAssert) {
    assert.ok(new AtJSON({content: 'Hello World.'}));
  }

  @test
  'constructor will set annotations'(assert: QUnitAssert) {
    assert.ok(new AtJSON({
      content: 'Hello World.',
      annotations: [ { type: 'test', start: 0, end: 2 } ]
    }));
  }
}
