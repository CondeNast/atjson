import Document from '@atjson/document';
import { HIR } from '@atjson/hir';
import HTMLSource from '@atjson/source-html';

describe('@atjson/source-html', () => {
  test('pre-code', () => {
    let doc = new HTMLSource('<pre><code>this <b>is</b> a test</code></pre>');
    let hir = new HIR(doc).toJSON();

    expect(hir).toEqual({
      type: 'root',
      attributes: undefined,
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
    let doc = new HTMLSource('<p>aaa<br />\nbbb</p>');
    let hir = new HIR(doc).toJSON();
    expect(hir).toEqual({
      type: 'root',
      attributes: undefined,
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
    let doc = new HTMLSource('<a href="https://example.com">example</a>');
    let hir = new HIR(doc).toJSON();

    expect(hir).toEqual({
      type: 'root',
      attributes: undefined,
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
    let doc = new HTMLSource('<img src="https://example.com/test.png" /> ');
    let hir = new HIR(doc).toJSON();
    expect(hir).toEqual({
      type: 'root',
      attributes: undefined,
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
    let doc = new HTMLSource('<h2></h2>\n<h1></h1>\n<h3></h3>');
    let hir = new HIR(doc).toJSON();
    expect(hir).toEqual({
      type: 'root',
      attributes: undefined,
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
    let doc = new HTMLSource('<p><img src="/url" alt="Foo" title="title" /></p>');
    let hir = new HIR(doc).toJSON();
    expect(hir).toEqual({
      type: 'root',
      attributes: undefined,
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
    let doc = new HTMLSource('<p>**<a href="**"></p>');
    let hir = new HIR(doc).toJSON();
    expect(hir).toEqual({
      type: 'root',
      attributes: undefined,
      children: [{
        type: 'p',
        attributes: {},
        children: [
          '**',
          { type: 'a', attributes: {}, children: [] }
        ]
      }]
    });
  });

  test('&lt;&gt;', () => {
    let doc = new HTMLSource('&lt;&gt;');
    let hir = new HIR(doc).toJSON();
    expect(hir).toEqual({
      type: 'root',
      attributes: undefined,
      children: ['<>']
    });
  });

  test('<a href="https://en.wiktionary.org/wiki/%E6%97%A5%E6%9C%AC%E4%BA%BA"></a>', () => {
    let doc = new HTMLSource('<a href="https://en.wiktionary.org/wiki/%E6%97%A5%E6%9C%AC%E4%BA%BA"></a>');
    let hir = new HIR(doc).toJSON();
    expect(hir).toEqual({
      type: 'root',
      attributes: undefined,
      children: [{
        type: 'a',
        attributes {
          href: 'https://en.wiktionary.org/wiki/日本人'
        },
        children: []
      }]
    });
  });
});
