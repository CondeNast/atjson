import Document, { Annotation, BlockAnnotation, InlineAnnotation } from '@atjson/document';
import { HIR, TextAnnotation } from '@atjson/hir';
import HIRRenderer, { Context, escapeHTML } from '../src/index';

class Bold extends InlineAnnotation {
  static vendorPrefix = 'test';
  static type = 'bold';
}

class Italic extends InlineAnnotation {
  static vendorPrefix = 'test';
  static type = 'italic';
}

class BlockQuote extends BlockAnnotation {
  static vendorPrefix = 'test';
  static type = 'block-quote';
}

class TestSource extends Document {
  static contentType = 'application/vnd.atjson+test';
  static schema = [Bold, Italic, BlockQuote];
}

function text(t: string, start: number): Annotation {
  return new TextAnnotation({
    id: 'Any<id>',
    start,
    end: start + t.length,
    attributes: {
      text: t
    }
  });
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
      annotation: bold.annotation,
      parent: root.annotation,
      previous: text('This is ', 0),
      next: italic.annotation,
      children: [text('bold', 8), boldAndItalic.annotation]
    }, {
      annotation: boldAndItalic.annotation,
      parent: bold.annotation,
      previous: text('bold', 8),
      next: null,
      children: [text(' and ', 12)]
    }, {
      annotation: italic.annotation,
      parent: root.annotation,
      previous: bold.annotation,
      next: text(' text', 23),
      children: [text('italic', 17)]
    }];

    let textBuilder: string[] = [
      ' and ',
      'bold and ',
      'italic',
      'This is bold and italic text'
    ];

    class ConcreteRenderer extends HIRRenderer {
      *renderAnnotation(annotation: Annotation<any>, context: Context): IterableIterator<any> {
        let expected = callStack.shift() as Context & { annotation: Annotation<any> };
        expect(annotation.toJSON()).toMatchObject(expected.annotation.toJSON());

        if (parent) {
          expect(context.parent.toJSON()).toMatchObject(expected.parent.toJSON());
        } else {
          expect(context.parent).toBe(expected.parent);
        }

        if (context.previous != null && expected.previous != null) {
          expect(context.previous.toJSON()).toMatchObject(expected.previous.toJSON());
        } else {
          expect(context.previous).toBe(expected.previous);
        }

        if (context.next != null && expected.next != null) {
          expect(context.next.toJSON()).toMatchObject(expected.next.toJSON());
        } else {
          expect(context.next).toBe(expected.next);
        }

        expect(context.children.map(a => a.toJSON())).toMatchObject(expected.children.map(a => a.toJSON()));

        let rawText: string[] = yield;
        expect(rawText.join('')).toEqual(textBuilder.shift());
        return rawText.join('');
      }

      *root() {
        let rawText: string[] = yield;
        expect(rawText.join('')).toEqual(textBuilder.shift());
        return rawText.join('');
      }
    }

    ConcreteRenderer.render(atjson);
  });

  it('escapes HTML entities in text', () => {
    let atjson = new TestSource({
      content: `This <html-element with="param" and-another='param'> should render as plain text`,
      annotations: []
    });

    class ConcreteRenderer extends HIRRenderer {
      text(t: string): string {
        return escapeHTML(t);
      }
      *root(): IterableIterator<any> {
        let rawText: string[] = yield;
        return rawText.join('');
      }
      *renderAnnotation(): IterableIterator<any> {
        let rawText: string[] = yield;
        return rawText.join('');
      }
    }

    expect(ConcreteRenderer.render(atjson)).toBe('This &lt;html-element with&#x3D;&quot;param&quot; and-another&#x3D;&#x27;param&#x27;&gt; should render as plain text');
  });

  it('will look at the type to call the rendering part on', () => {
    let doc = new TestSource({
      content: 'I am very excited',
      annotations: [
        new BlockQuote({ start: 0, end: 17 }),
        new Bold({ start: 0, end: 17 }),
        new Italic({ start: 5, end: 9 })
      ]
    });

    class SlackRenderer extends HIRRenderer {
      *'block-quote'() {
        let words = yield;
        return `> ${words.join('')}`;
      }

      *'bold'() {
        let words = yield;
        return `*${words.join('')}*`;
      }

      *'italic'() {
        let words = yield;
        return `_${words.join('')}_`;
      }

      *root(): IterableIterator<any> {
        let rawText: string[] = yield;
        return rawText.join('');
      }
    }

    expect(SlackRenderer.render(doc)).toBe('> *I am _very_ excited*');
  });

  it('does a class-like lookup for rendering', () => {
    let doc = new TestSource({
      content: 'I am very excited',
      annotations: [
        new BlockQuote({ start: 0, end: 17 }),
        new Bold({ start: 0, end: 17 }),
        new Italic({ start: 5, end: 9 })
      ]
    });

    class SlackRenderer extends HIRRenderer {
      *BlockQuote() {
        let words = yield;
        return `> ${words.join('')}`;
      }

      *Bold() {
        let words = yield;
        return `*${words.join('')}*`;
      }

      *Italic() {
        let words = yield;
        return `_${words.join('')}_`;
      }

      *root(): IterableIterator<any> {
        let rawText: string[] = yield;
        return rawText.join('');
      }
    }

    expect(SlackRenderer.render(doc)).toBe('> *I am _very_ excited*');
  });
});
