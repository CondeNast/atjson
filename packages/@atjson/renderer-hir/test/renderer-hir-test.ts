import Document, { AnyAnnotation, InlineAnnotation } from '@atjson/document';
import { HIR, HIRNode } from '@atjson/hir';
import HIRRenderer, { escapeHTML } from '../src/index';

class Bold extends InlineAnnotation {
  static vendorPrefix = 'test';
  static type = 'bold';
}

class Italic extends InlineAnnotation {
  static vendorPrefix = 'test';
  static type = 'italic';
}

class TestSource extends Document {
  static contentType = 'application/vnd.atjson+test';
  static schema = [Bold, Italic];
}

describe('@atjson/renderer-hir', () => {
  it('defines an abstract rendering interface', () => {
    let atjson = new TestSource({
      content: 'This is bold and italic text',
      annotations: [{
        type: '-test-bold', start: 8, end: 17, attributes: {}
      }, {
        type: '-test-italic', start: 12, end: 23, attributes: {}
      }]
    });

    let root = new HIR(atjson).rootNode;
    let callStack = [
      root.annotation,
      root.children()[1].annotation,
      root.children()[1].children()[1].annotation,
      root.children()[2].annotation
    ];

    let textBuilder: string[] = [
      ' and ',
      'bold and ',
      'italic',
      'This is bold and italic text'
    ];

    class ConcreteRenderer extends HIRRenderer {
      *renderAnnotation(annotation: AnyAnnotation): IterableIterator<any> {
        expect(annotation).toEqual(callStack.shift());

        let text: string[] = yield;
        expect(text.join('')).toEqual(textBuilder.shift());
        return text.join('');
      }
    }

    let renderer = new ConcreteRenderer();
    renderer.render(atjson);
  });

  it('escapes HTML entities in text', () => {
    let atjson = new TestSource({
      content: `This <html-element with="param" and-another='param'> should render as plain text`,
      annotations: []
    });

    class ConcreteRenderer extends HIRRenderer {
      text(text: string): string {
        return escapeHTML(text);
      }
      *renderAnnotation(annotation: AnyAnnotation): IterableIterator<any> {
        let text: string[] = yield;
        return text.join('');
      }
    }

    let renderer = new ConcreteRenderer();
    expect(renderer.render(atjson)).toBe('This &lt;html-element with&#x3D;&quot;param&quot; and-another&#x3D;&#x27;param&#x27;&gt; should render as plain text');
  });
});
