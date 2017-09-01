import { module, test, TestCase, QUnitAssert } from './support';

@module("dummy")
export class DummyTest extends TestCase {
  @test
  function (assert: QUnitAssert) {
    assert.ok(true);
  }
}
