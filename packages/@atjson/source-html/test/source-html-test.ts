import { HIR } from '@atjson/hir';
import OffsetSource from '@atjson/offset-annotations';
import HTMLSource from '../src';

describe('@atjson/source-html', () => {
  test('pre-code', () => {
    let doc = HTMLSource.fromRaw('<pre><code>this <b>is</b> a test</code></pre>');
    let hir = new HIR(doc).toJSON();

    expect(hir).toMatchObject({
      type: 'Root',
      attributes: {},
      children: [{
        type: 'pre',
        attributes: {},
        children: [{
          type: 'code',
          attributes: {},
          children: [
            'this ', {
              type: 'b',
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
    let doc = HTMLSource.fromRaw('<p>aaa<br />\nbbb</p>');
    let hir = new HIR(doc).toJSON();
    expect(hir).toMatchObject({
      type: 'Root',
      attributes: {},
      children: [{
        type: 'p',
        attributes: {},
        children: [
          'aaa', { type: 'br', attributes: {}, children: [] }, '\nbbb'
        ]
      }]
    });
  });

  test('<a href="https://example.com">example</a>', () => {
    let doc = HTMLSource.fromRaw('<a href="https://example.com">example</a>');
    let hir = new HIR(doc).toJSON();

    expect(hir).toMatchObject({
      type: 'Root',
      attributes: {},
      children: [{
        type: 'a',
        attributes: {
          href: 'https://example.com'
        },
        children: ['example']
      }]
    });
  });

  test('<img src="https://example.com/test.png" /> ', () => {
    let doc = HTMLSource.fromRaw('<img src="https://example.com/test.png" /> ');
    let hir = new HIR(doc).toJSON();
    expect(hir).toMatchObject({
      type: 'Root',
      attributes: {},
      children: [{
        type: 'img',
        attributes: {
          src: 'https://example.com/test.png'
        },
        children: []
      }, ' ']
    });
  });

  test('<h2></h2>\n<h1></h1>\n<h3></h3>', () => {
    let doc = HTMLSource.fromRaw('<h2></h2>\n<h1></h1>\n<h3></h3>');
    let hir = new HIR(doc).toJSON();
    expect(hir).toMatchObject({
      type: 'Root',
      attributes: {},
      children: [{
        type: 'h2',
        attributes: {},
        children: []
      }, '\n', {
        type: 'h1',
        attributes: {},
        children: []
      }, '\n', {
        type: 'h3',
        attributes: {},
        children: []
      }]
    });
  });

  test('<p><img src="/url" alt="Foo" title="title" /></p>', () => {
    let doc = HTMLSource.fromRaw('<p><img src="/url" alt="Foo" title="title" /></p>');
    let hir = new HIR(doc).toJSON();
    expect(hir).toMatchObject({
      type: 'Root',
      attributes: {},
      children: [{
        type: 'p',
        attributes: {},
        children: [{
          type: 'img',
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
    let doc = HTMLSource.fromRaw('<p>**<a href="**"></p>');
    let hir = new HIR(doc).toJSON();
    expect(hir).toMatchObject({
      type: 'Root',
      attributes: {},
      children: [{
        type: 'p',
        attributes: {},
        children: ['**', {
          type: 'a',
          attributes: {
            href: '**'
          }, children: []
        }]
      }]
    });
  });

  test('&lt;&gt;', () => {
    let doc = HTMLSource.fromRaw('&lt;&gt;');
    let hir = new HIR(doc).toJSON();
    expect(hir).toMatchObject({
      type: 'Root',
      attributes: {},
      children: ['<>']
    });
  });

  test('<a href="https://en.wiktionary.org/wiki/%E6%97%A5%E6%9C%AC%E4%BA%BA"></a>', () => {
    let doc = HTMLSource.fromRaw('<a href="https://en.wiktionary.org/wiki/%E6%97%A5%E6%9C%AC%E4%BA%BA"></a>');
    let hir = new HIR(doc).toJSON();
    expect(hir).toMatchObject({
      type: 'Root',
      attributes: {},
      children: [{
        type: 'a',
        attributes: {
          href: 'https://en.wiktionary.org/wiki/日本人'
        },
        children: []
      }]
    });
  });

  describe('translator to common schema', () => {
    test('bold, strong', () => {
      let doc = HTMLSource.fromRaw('This <b>text</b> is <strong>bold</strong>');
      let hir = new HIR(doc.convertTo(OffsetSource)).toJSON();
      expect(hir).toMatchObject({
        type: 'Root',
        attributes: {},
        children: ['This ', {
          type: 'Bold',
          attributes: {},
          children: ['text']
        }, ' is ', {
          type: 'Bold',
          attributes: {},
          children: ['bold']
        }]
      });
    });

    test('i, em', () => {
      let doc = HTMLSource.fromRaw('This <i>text</i> is <em>italic</em>');
      let hir = new HIR(doc.convertTo(OffsetSource)).toJSON();
      expect(hir).toMatchObject({
        type: 'Root',
        attributes: {},
        children: ['This ', {
          type: 'Italic',
          attributes: {},
          children: ['text']
        }, ' is ', {
          type: 'Italic',
          attributes: {},
          children: ['italic']
        }]
      });
    });

    test('h1, h2, h3, h4, h5, h6', () => {
      let doc = HTMLSource.fromRaw('<h1>Title</h1><h2>Byline</h2><h3>Section</h3><h4>Normal heading</h4><h5>Small heading</h5><h6>Tiny heading</h6>');
      let hir = new HIR(doc.convertTo(OffsetSource)).toJSON();
      expect(hir).toMatchObject({
        type: 'Root',
        attributes: {},
        children: [{
          type: 'Heading',
          attributes: { level: 1 },
          children: ['Title']
        }, {
          type: 'Heading',
          attributes: { level: 2 },
          children: ['Byline']
        }, {
          type: 'Heading',
          attributes: { level: 3 },
          children: ['Section']
        }, {
          type: 'Heading',
          attributes: { level: 4 },
          children: ['Normal heading']
        }, {
          type: 'Heading',
          attributes: { level: 5 },
          children: ['Small heading']
        }, {
          type: 'Heading',
          attributes: { level: 6 },
          children: ['Tiny heading']
        }]
      });
    });

    test('p, br', () => {
      let doc = HTMLSource.fromRaw('<p>This paragraph has a<br>line break</p>');
      let hir = new HIR(doc.convertTo(OffsetSource)).toJSON();
      expect(hir).toMatchObject({
        type: 'Root',
        attributes: {},
        children: [{
          type: 'Paragraph',
          attributes: {},
          children: ['This paragraph has a', {
            type: 'LineBreak',
            attributes: {},
            children: []
          }, 'line break']
        }]
      });
    });

    test('a', () => {
      let doc = HTMLSource.fromRaw('This <a href="https://condenast.com">is a link</a>');
      let hir = new HIR(doc.convertTo(OffsetSource)).toJSON();
      expect(hir).toMatchObject({
        type: 'Root',
        attributes: {},
        children: ['This ', {
          type: 'Link',
          attributes: {
            url: 'https://condenast.com'
          },
          children: ['is a link']
        }]
      });
    });

    test('hr', () => {
      let doc = HTMLSource.fromRaw('Horizontal <hr> rules!');
      let hir = new HIR(doc.convertTo(OffsetSource)).toJSON();
      expect(hir).toMatchObject({
        type: 'Root',
        attributes: {},
        children: ['Horizontal ', {
          type: 'HorizontalRule',
          attributes: {},
          children: []
        }, ' rules!']
      });
    });

    test('img', () => {
      let doc = HTMLSource.fromRaw('<img src="https://pbs.twimg.com/media/DXiMcM9X4AEhR3u.jpg" alt="Miles Davis came out, blond, in gold lamé, and he plays really terrific music. High heels. 4/6/86" title="Miles Davis & Andy Warhol">');
      let hir = new HIR(doc.convertTo(OffsetSource)).toJSON();
      expect(hir).toMatchObject({
        type: 'Root',
        attributes: {},
        children: [{
          type: 'Image',
          attributes: {
            url: 'https://pbs.twimg.com/media/DXiMcM9X4AEhR3u.jpg',
            description: {
              attributes: {},
              type: 'Root',
              children: [
                'Miles Davis came out, blond, in gold lamé, and he plays really terrific music. High heels. 4/6/86'
              ]
            },
            title: 'Miles Davis & Andy Warhol'
          },
          children: []
        }]
      });
    });

    test('blockquote', () => {
      let doc = HTMLSource.fromRaw('<blockquote>This is a quote</blockquote>');
      let hir = new HIR(doc.convertTo(OffsetSource)).toJSON();
      expect(hir).toMatchObject({
        type: 'Root',
        attributes: {},
        children: [{
          type: 'Blockquote',
          attributes: {},
          children: ['This is a quote']
        }]
      });
    });

    test('ul, ol, li', () => {
      let doc = HTMLSource.fromRaw('<ol starts="2"><li>Second</li><li>Third</li></ol><ul><li>First</li><li>Second</li></ul>');
      let hir = new HIR(doc.convertTo(OffsetSource)).toJSON();
      expect(hir).toMatchObject({
        type: 'Root',
        attributes: {},
        children: [{
          type: 'List',
          attributes: {
            type: 'numbered',
            startsAt: 2
          },
          children: [{
            type: 'ListItem',
            attributes: {},
            children: ['Second']
          }, {
            type: 'ListItem',
            attributes: {},
            children: ['Third']
          }]
        }, {
          type: 'List',
          attributes: {
            type: 'bulleted'
          },
          children: [{
            type: 'ListItem',
            attributes: {},
            children: ['First']
          }, {
            type: 'ListItem',
            attributes: {},
            children: ['Second']
          }]
        }]
      });
    });
  });
});
