import { AtJSON } from '@atjson/core';
import { HIR, HIRNode } from '@atjson/hir';
import Renderer from '@atjson/renderer';

QUnit.module('@atjson/renderer tests');

QUnit.test('renderer abstract interface', function (assert) {
  let hir = new HIR(new AtJSON({
    content: 'This is bold and italic text',
    annotations: [{
      type: 'bold', start: 8, end: 17
    }, {
      type: 'italic', start: 12, end: 23
    }]
  }));

  let root = hir.toJSON();
  let callStack = [
    root,
    root.children[1],
    root.children[1].children[1],
    root.children[2]
  ];

  let textBuilder = [
    ' and ',
    'bold and ',
    'italic',
    'This is bold and italic text'
  ];

  class ConcreteRenderer extends Renderer {
    *renderAnnotation(annotation: HIRNode): IterableIterator<string> {
      assert.deepEqual(annotation, callStack.shift());

      let text: string[] = yield;
      assert.deepEqual(text.join(''), textBuilder.shift());
      return text.join('');
    }
  }

  let renderer = new ConcreteRenderer();
  renderer.render(hir);
});
