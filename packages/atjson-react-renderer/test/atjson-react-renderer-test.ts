import hello from 'atjson-react-renderer';

QUnit.module('atjson-react-renderer tests');

QUnit.test('hello', assert => {
  assert.equal(hello(), 'Hello from atjson-react-renderer');
});
