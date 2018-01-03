import { AtJSON } from '@atjson/core';
import { HIR, HIRNode } from '@atjson/hir';
import HIRRenderer, { escapeHTML } from '@atjson/renderer-hir';

describe('@atjson/renderer-hir', function () {
  it('defines an abstract rendering interface', function () {
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

    class ConcreteRenderer extends HIRRenderer {
      *renderAnnotation(annotation: HIRNode): IterableIterator<string> {
        expect(annotation).toEqual(callStack.shift());

        let text: string[] = yield;
        expect(text.join('')).toEqual(textBuilder.shift());
        return text.join('');
      }
    }

    let renderer = new ConcreteRenderer();
    renderer.render(atjson);
  });

  it('escapes HTML entities in text', function () {
    let atjson = new AtJSON({
      content: `This <html-element with="param" and-another='param'> should render as plain text`
    });

    class ConcreteRenderer extends HIRRenderer {
      renderText(text: string): string {
        return escapeHTML(text);
      }
      *renderAnnotation(annotation: HIRNode): IterableIterator<string> {
        let text: string[] = yield;
        return text.join('');
      }
    }

    let renderer = new ConcreteRenderer();
    expect(renderer.render(atjson)).toBe('This &lt;html-element with&#x3D;&quot;param&quot; and-another&#x3D;&#x27;param&#x27;&gt; should render as plain text');
  });
});
