import { HIR } from '@atjson/hir';
import HTMLSource from '../src';

describe('@atjson/source-html', () => {
  test('pre-code', () => {
    let doc = new HTMLSource('<pre><code>this <b>is</b> a test</code></pre>');
    let hir = new HIR(doc).toJSON();

    expect(hir).toEqual({
      type: 'root',
      attributes: {},
      children: [{
        type: '-html-pre',
        attributes: {},
        children: [{
          type: '-html-code',
          attributes: {},
          children: [
            'this ', {
              type: '-html-b',
              attributes: {},
              children: ['is']
            },
            ' a test'
          ]
        }]
      }]
    });
  });

  test('<p>aaa<br />\nbbb</p>', () => {
    let doc = new HTMLSource('<p>aaa<br />\nbbb</p>');
    let hir = new HIR(doc).toJSON();
    expect(hir).toEqual({
      type: 'root',
      attributes: {},
      children: [{
        type: '-html-p',
        attributes: {},
        children: [
          'aaa', { type: '-html-br', attributes: {}, children: [] }, '\nbbb'
        ]
      }]
    });
  });

  test('<a href="https://example.com">example</a>', () => {
    let doc = new HTMLSource('<a href="https://example.com">example</a>');
    let hir = new HIR(doc).toJSON();

    expect(hir).toEqual({
      type: 'root',
      attributes: {},
      children: [{
        type: '-html-a',
        attributes: {
          href: 'https://example.com'
        },
        children: ['example']
      }]
    });
  });

  test('<img src="https://example.com/test.png" /> ', () => {
    let doc = new HTMLSource('<img src="https://example.com/test.png" /> ');
    let hir = new HIR(doc).toJSON();
    expect(hir).toEqual({
      type: 'root',
      attributes: {},
      children: [{
        type: '-html-img',
        attributes: {
          src: 'https://example.com/test.png'
        },
        children: []
      }, ' ']
    });
  });

  test('<h2></h2>\n<h1></h1>\n<h3></h3>', () => {
    let doc = new HTMLSource('<h2></h2>\n<h1></h1>\n<h3></h3>');
    let hir = new HIR(doc).toJSON();
    expect(hir).toEqual({
      type: 'root',
      attributes: {},
      children: [{
        type: '-html-h2',
        attributes: {},
        children: []
      }, '\n', {
        type: '-html-h1',
        attributes: {},
        children: []
      }, '\n', {
        type: '-html-h3',
        attributes: {},
        children: []
      }]
    });
  });

  test('<p><img src="/url" alt="Foo" title="title" /></p>', () => {
    let doc = new HTMLSource('<p><img src="/url" alt="Foo" title="title" /></p>');
    let hir = new HIR(doc).toJSON();
    expect(hir).toEqual({
      type: 'root',
      attributes: {},
      children: [{
        type: '-html-p',
        attributes: {},
        children: [{
          type: '-html-img',
          attributes: {
            src: '/url',
            alt: 'Foo',
            title: 'title'
          },
          children: []
        }]
      }]
    });
  });

  test('<p>**<a href="**"></p>', () => {
    let doc = new HTMLSource('<p>**<a href="**"></p>');
    let hir = new HIR(doc).toJSON();
    expect(hir).toEqual({
      type: 'root',
      attributes: {},
      children: [{
        type: '-html-p',
        attributes: {},
        children: ['**', {
          type: '-html-a',
          attributes: {
            href: '**'
          }, children: []
        }]
      }]
    });
  });

  test('&lt;&gt;', () => {
    let doc = new HTMLSource('&lt;&gt;');
    let hir = new HIR(doc).toJSON();
    expect(hir).toEqual({
      type: 'root',
      attributes: {},
      children: ['<>']
    });
  });

  test('<a href="https://en.wiktionary.org/wiki/%E6%97%A5%E6%9C%AC%E4%BA%BA"></a>', () => {
    let doc = new HTMLSource('<a href="https://en.wiktionary.org/wiki/%E6%97%A5%E6%9C%AC%E4%BA%BA"></a>');
    let hir = new HIR(doc).toJSON();
    expect(hir).toEqual({
      type: 'root',
      attributes: {},
      children: [{
        type: '-html-a',
        attributes: {
          href: 'https://en.wiktionary.org/wiki/日本人'
        },
        children: []
      }]
    });
  });

  describe('translator to common schema', () => {
    test('bold, strong', () => {
      let doc = new HTMLSource('This <b>text</b> is <strong>bold</strong>');
      let hir = new HIR(doc.toCommonSchema()).toJSON();
      expect(hir).toEqual({
        type: 'root',
        attributes: {},
        children: ['This ', {
          type: 'bold',
          attributes: {},
          children: ['text']
        }, ' is ', {
          type: 'bold',
          attributes: {},
          children: ['bold']
        }]
      });
    });

    test('i, em', () => {
      let doc = new HTMLSource('This <i>text</i> is <em>italic</em>');
      let hir = new HIR(doc.toCommonSchema()).toJSON();
      expect(hir).toEqual({
        type: 'root',
        attributes: {},
        children: ['This ', {
          type: 'italic',
          attributes: {},
          children: ['text']
        }, ' is ', {
          type: 'italic',
          attributes: {},
          children: ['italic']
        }]
      });
    });

    test('h1, h2, h3, h4, h5, h6', () => {
      let doc = new HTMLSource('<h1>Title</h1><h2>Byline</h2><h3>Section</h3><h4>Normal heading</h4><h5>Small heading</h5><h6>Tiny heading</h6>');
      let hir = new HIR(doc.toCommonSchema()).toJSON();
      expect(hir).toEqual({
        type: 'root',
        attributes: {},
        children: [{
          type: 'heading',
          attributes: { level: 1 },
          children: ['Title']
        }, {
          type: 'heading',
          attributes: { level: 2 },
          children: ['Byline']
        }, {
          type: 'heading',
          attributes: { level: 3 },
          children: ['Section']
        }, {
          type: 'heading',
          attributes: { level: 4 },
          children: ['Normal heading']
        }, {
          type: 'heading',
          attributes: { level: 5 },
          children: ['Small heading']
        }, {
          type: 'heading',
          attributes: { level: 6 },
          children: ['Tiny heading']
        }]
      });
    });

    test('p, br', () => {
      let doc = new HTMLSource('<p>This paragraph has a<br>line break</p>');
      let hir = new HIR(doc.toCommonSchema()).toJSON();
      expect(hir).toEqual({
        type: 'root',
        attributes: {},
        children: [{
          type: 'paragraph',
          attributes: {},
          children: ['This paragraph has a', {
            type: 'line-break',
            attributes: {},
            children: []
          }, 'line break']
        }]
      });
    });

    test('a', () => {
      let doc = new HTMLSource('This <a href="https://condenast.com">is a link</a>');
      let hir = new HIR(doc.toCommonSchema()).toJSON();
      expect(hir).toEqual({
        type: 'root',
        attributes: {},
        children: ['This ', {
          type: 'link',
          attributes: {
            url: 'https://condenast.com'
          },
          children: ['is a link']
        }]
      });
    });

    test('hr', () => {
      let doc = new HTMLSource('Horizontal <hr> rules!');
      let hir = new HIR(doc.toCommonSchema()).toJSON();
      expect(hir).toEqual({
        type: 'root',
        attributes: {},
        children: ['Horizontal ', {
          type: 'horizontal-rule',
          attributes: {},
          children: []
        }, ' rules!']
      });
    });

    test('img', () => {
      let doc = new HTMLSource('<img src="https://pbs.twimg.com/media/DXiMcM9X4AEhR3u.jpg" alt="Miles Davis came out, blond, in gold lamé, and he plays really terrific music. High heels. 4/6/86" title="Miles Davis & Andy Warhol">');
      let hir = new HIR(doc.toCommonSchema()).toJSON();
      expect(hir).toEqual({
        type: 'root',
        attributes: {},
        children: [{
          type: 'image',
          attributes: {
            url: 'https://pbs.twimg.com/media/DXiMcM9X4AEhR3u.jpg',
            description: 'Miles Davis came out, blond, in gold lamé, and he plays really terrific music. High heels. 4/6/86',
            title: 'Miles Davis & Andy Warhol'
          },
          children: []
        }]
      });
    });

    test('blockquote', () => {
      let doc = new HTMLSource('<blockquote>This is a quote</blockquote>');
      let hir = new HIR(doc.toCommonSchema()).toJSON();
      expect(hir).toEqual({
        type: 'root',
        attributes: {},
        children: [{
          type: 'blockquote',
          attributes: {},
          children: ['This is a quote']
        }]
      });
    });

    test('ul, ol, li', () => {
      let doc = new HTMLSource('<ol starts="2"><li>Second</li><li>Third</li></ol><ul><li>First</li><li>Second</li></ul>');
      let hir = new HIR(doc.toCommonSchema()).toJSON();
      expect(hir).toEqual({
        type: 'root',
        attributes: {},
        children: [{
          type: 'list',
          attributes: {
            type: 'numbered',
            startsAt: 2
          },
          children: [{
            type: 'list-item',
            attributes: {},
            children: ['Second']
          }, {
            type: 'list-item',
            attributes: {},
            children: ['Third']
          }]
        }, {
          type: 'list',
          attributes: {
            type: 'bulleted'
          },
          children: [{
            type: 'list-item',
            attributes: {},
            children: ['First']
          }, {
            type: 'list-item',
            attributes: {},
            children: ['Second']
          }]
        }]
      });
    });
  });
});
