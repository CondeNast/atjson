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
        id: '1', type: '-test-bold', start: 8, end: 17, attributes: {}
      }, {
        id: '2', type: '-test-italic', start: 12, end: 23, attributes: {}
      }]
    });

    let root = new HIR(atjson).rootNode;
    let [, bold, italic] = root.children();
    let boldAndItalic = bold.children()[1];

    let callStack = [{
      annotation: root.annotation,
      parent: null,
      previous: null,
      next: null,
      children: ['This is ', bold.annotation, italic.annotation, ' text']
    }, {
      annotation: bold.annotation,
      parent: root.annotation,
      previous: null,
      next: italic.annotation,
      children: ['bold', boldAndItalic.annotation]
    }, {
      annotation: boldAndItalic.annotation,
      parent: bold.annotation,
      previous: null,
      next: null,
      children: [' and ']
    }, {
      annotation: italic.annotation,
      parent: root.annotation,
      previous: bold.annotation,
      next: null,
      children: ['italic']
    }];

    let textBuilder: string[] = [
      ' and ',
      'bold and ',
      'italic',
      'This is bold and italic text'
    ];

    class ConcreteRenderer extends HIRRenderer {
      *renderAnnotation(annotation: AnyAnnotation): IterableIterator<any> {
        let expected = callStack.shift();
        expect(annotation.toJSON()).toEqual(expected.annotation.toJSON());

        if (annotation.parent) {
          expect(annotation.parent.toJSON()).toEqual(expected.parent.toJSON());
        } else {
          expect(annotation.parent).toBe(expected.parent);
        }

        if (annotation.previous) {
          expect(annotation.previous.toJSON()).toEqual(expected.previous.toJSON());
        } else {
          expect(annotation.previous).toBe(expected.previous);
        }

        if (annotation.next) {
          expect(annotation.next.toJSON()).toEqual(expected.next.toJSON());
        } else {
          expect(annotation.next).toBe(expected.next);
        }

        expect(annotation.children).toEqual(expected.children);

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
      *renderAnnotation(): IterableIterator<any> {
        let text: string[] = yield;
        return text.join('');
      }
    }

    let renderer = new ConcreteRenderer();
    expect(renderer.render(atjson)).toBe('This &lt;html-element with&#x3D;&quot;param&quot; and-another&#x3D;&#x27;param&#x27;&gt; should render as plain text');
  });
});
