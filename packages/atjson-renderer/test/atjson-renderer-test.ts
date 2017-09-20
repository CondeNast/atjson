import Renderer from 'atjson-renderer';

QUnit.module('atjson-renderer tests');

QUnit.test('hello', assert => {
  let renderer = new Renderer();
  assert.equal(renderer.render(), 'Hello from atjson-renderer');
});
