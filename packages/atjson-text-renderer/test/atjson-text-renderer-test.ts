import hello from 'atjson-text-renderer';

QUnit.module('atjson-text-renderer tests');

QUnit.test('hello', assert => {
  assert.equal(hello(), 'Hello from atjson-text-renderer');
});
