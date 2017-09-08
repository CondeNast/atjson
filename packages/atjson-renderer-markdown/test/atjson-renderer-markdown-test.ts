import hello from 'atjson-renderer-markdown';

QUnit.module('atjson-renderer-markdown tests');

QUnit.test('hello', assert => {
  assert.equal(hello(), 'Hello from atjson-renderer-markdown');
});
