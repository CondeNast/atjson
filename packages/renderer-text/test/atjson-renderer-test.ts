import { AtJSON } from '@atjson/core';
import { HIR, HIRNode } from '@atjson/hir';
import TextRenderer from '@atjson/renderer-text';

QUnit.module('@atjson/renderer-text tests');

QUnit.test('renderer abstract interface', assert => {
  let atjson = new AtJSON({
    content: 'This is bold and italic text',
    annotations: [{
      type: 'bold', start: 8, end: 17
    }, {
      type: 'italic', start: 12, end: 23
    }]
  });

  let root = new HIR(atjson).rootNode;
  let callStack = [
    root,
    root.children()[1],
    root.children()[1].children()[1],
    root.children()[2]
  ];

  let textBuilder: string[] = [
    ' and ',
    'bold and ',
    'italic',
    'This is bold and italic text'
  ];

  class ConcreteRenderer extends TextRenderer {
    *renderAnnotation(annotation: HIRNode): IterableIterator<string> {
      assert.deepEqual(annotation, callStack.shift());

      let text: string[] = yield;
      assert.deepEqual(text.join(''), textBuilder.shift());
      return text.join('');
    }
  }

  let renderer = new ConcreteRenderer();
  renderer.render(atjson);
});
