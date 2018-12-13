import { InlineAnnotation } from '@atjson/document';
import { HIR } from '@atjson/hir';
import MobiledocSource from '../src';
import { ListSection } from '../src/parser';

describe('@atjson/source-Mobiledoc', () => {
  describe('sections', () => {
    describe.each(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pull-quote', 'aside'])('%s', type => {
      test('with text', () => {
        let doc = MobiledocSource.fromRaw({
          version: '0.3.1',
          atoms: [],
          cards: [],
          markups: [],
          sections: [
            [ 1, type.toUpperCase(), [ [ 0, [], 0, 'hello' ] ] ]
          ]
        });
        let hir = new HIR(doc).toJSON();

        expect(hir).toMatchObject({
          type: 'root',
          attributes: {},
          children: [{
            type,
            attributes: {},
            children: ['hello']
          }]
        });
      });

      test('without text', () => {
        let doc = MobiledocSource.fromRaw({
          version: '0.3.1',
          atoms: [],
          cards: [],
          markups: [],
          sections: [
            [ 1, type.toUpperCase(), [ [ 0, [], 0, '' ] ] ]
          ]
        });
        let hir = new HIR(doc).toJSON();

        expect(hir).toMatchObject({
          type: 'root',
          attributes: {},
          children: [{
            type,
            attributes: {},
            children: []
          }]
        });
      });
    });
  });

  describe('markup', () => {
    test.each(['b', 'code', 'em', 'i', 's', 'strong', 'sub', 'sup', 'u'])('%s', type => {
      let doc = MobiledocSource.fromRaw({
        version: '0.3.1',
        atoms: [],
        cards: [],
        markups: [
          [type.toUpperCase()]
        ],
        sections: [
          [
            1, 'P', [
              [0, [0], 1, 'hello']
            ]
          ]
        ]
      });

      let hir = new HIR(doc).toJSON();

      expect(hir).toMatchObject({
        type: 'root',
        attributes: {},
        children: [{
          type: 'p',
          attributes: {},
          children: [{
            type,
            attributes: {},
            children: ['hello']
          }]
        }]
      });
    });

    test('simple markup', () => {
      let doc = MobiledocSource.fromRaw({
        version: '0.3.1',
        atoms: [],
        cards: [],
        markups: [
          ['B'],
          ['A', ['href', 'google.com']]
        ],
        sections: [
          [
            1, 'P', [
              [0, [1], 0, 'hello '],     // a tag open
              [0, [0], 1, 'brave new'],  // b tag open/close
              [0, [], 1, ' world']       // a tag close
            ]
          ]
        ]
      });

      let hir = new HIR(doc).toJSON();

      expect(hir).toMatchObject({
        type: 'root',
        attributes: {},
        children: [{
          type: 'p',
          attributes: {},
          children: [{
            type: 'a',
            attributes: { href: 'google.com'},
            children: ['hello ', {
              type: 'b',
              attributes: {},
              children: ['brave new']
            }, ' world']
          }]
        }]
      });
    });

    test('multiple markups at a single position', () => {
      let doc = MobiledocSource.fromRaw({
        version: '0.3.1',
        atoms: [],
        cards: [],
        markups: [
          ['STRONG'],
          ['SUB']
        ],
        sections: [
          [
            1, 'P', [
              [0, [0, 1], 2, 'test']
            ]
          ]
        ]
      });

      let hir = new HIR(doc).toJSON();

      expect(hir).toMatchObject({
        type: 'root',
        attributes: {},
        children: [{
          type: 'p',
          attributes: {},
          children: [{
            type: 'sub',
            attributes: {},
            children: [{
              type: 'strong',
              attributes: {},
              children: ['test']
            }]
          }]
        }]
      });
    });

    test('overlapping markup', () => {
      let doc = MobiledocSource.fromRaw({
        version: '0.3.1',
        atoms: [],
        cards: [],
        markups: [
          ['EM'],
          ['STRONG'],
          ['U']
        ],
        sections: [
          [
            1, 'P', [
              [0, [0], 0, 'text that is '],
              [0, [1], 0, 'bold, '],
              [0, [2], 2, 'underlined'],
              [0, [], 1, ', and italicized'],
              [0, [], 0, ' plus some text after']
            ]
          ]
        ]
      });

      let hir = new HIR(doc).toJSON();

      expect(hir).toMatchObject({
        type: 'root',
        attributes: {},
        children: [{
          type: 'p',
          attributes: {},
          children: [{
            type: 'em',
            attributes: {},
            children: ['text that is ', {
              type: 'strong',
              attributes: {},
              children: ['bold, ', {
                type: 'u',
                attributes: {},
                children: ['underlined']
              }]
            }, ', and italicized']
          }, ' plus some text after']
        }]
      });
    });
  });

  test('atom', () => {
    class Mention extends InlineAnnotation {
      static vendorPrefix = 'mobiledoc';
      static type = 'mention-atom';
      attributes!: {
        id: number;
      };
    }

    class MentionSource extends MobiledocSource {
      static schema = [...MobiledocSource.schema, Mention];
    }

    let doc = MentionSource.fromRaw({
      version: '0.3.1',
      atoms: [
        ['mention', '@bob', { id: 42 }]
      ],
      cards: [],
      markups: [],
      sections: [
        [
          1, 'P', [
            [1, [], 0, 0]
          ]
        ]
      ]
    });

    let hir = new HIR(doc).toJSON();

    expect(hir).toMatchObject({
      type: 'root',
      attributes: {},
      children: [{
        type: 'p',
        attributes: {},
        children: [{
          type: 'mention-atom',
          attributes: { id: 42 },
          children: ['@bob']
        }]
      }]
    });
  });

  test('card', () => {
    class Gallery extends InlineAnnotation {
      static vendorPrefix = 'mobiledoc';
      static type = 'gallery-card';
      attributes!: {
        style: 'mosaic' | 'slideshow' | 'list';
        ids: number[];
      };
    }

    class GallerySource extends MobiledocSource {
      static schema = [...MobiledocSource.schema, Gallery];
    }

    let doc = GallerySource.fromRaw({
      version: '0.3.1',
      atoms: [],
      cards: [
        ['gallery', { style: 'mosaic', ids: [2, 4, 8, 14] }]
      ],
      markups: [],
      sections: [
        [
          10, 0
        ]
      ]
    });

    let hir = new HIR(doc).toJSON();

    expect(hir).toMatchObject({
      type: 'root',
      attributes: {},
      children: [{
        type: 'gallery-card',
        attributes: {
          style: 'mosaic',
          ids: [2, 4, 8, 14]
        }
      }]
    });
  });

  test('image', () => {
    let doc = MobiledocSource.fromRaw({
      version: '0.3.1',
      atoms: [],
      cards: [],
      markups: [],
      sections: [
        [2, 'https://example.com/example.png']
      ]
    });

    let hir = new HIR(doc).toJSON();

    expect(hir).toMatchObject({
      type: 'root',
      attributes: {},
      children: [{
        type: 'img',
        attributes: {
          src: 'https://example.com/example.png'
        },
        children: []
      }]
    });
  });

  describe('list', () => {
    test.each(['ol', 'ul'])('%s', type => {
      let doc = MobiledocSource.fromRaw({
        version: '0.3.1',
        atoms: [],
        cards: [],
        markups: [
          ['EM'],
          ['S']
        ],
        sections: [
          [3, type, [
            [
              [0, [], 0, 'first item '],
              [0, [0], 1, 'with italic text']
            ],
            [
              [0, [], 0, 'second item '],
              [0, [1], 1, 'with struck-through text']
            ]
          ]] as ListSection
        ]
      });

      let hir = new HIR(doc).toJSON();

      expect(hir).toMatchObject({
        type: 'root',
        attributes: {},
        children: [{
          type,
          attributes: {},
          children: [{
            type: 'li',
            attributes: {},
            children: [
              'first item ',
              {
                type: 'em',
                attributes: {},
                children: ['with italic text']
              }
            ]
          }, {
            type: 'li',
            attributes: {},
            children: [
              'second item ',
              {
                type: 's',
                attributes: {},
                children: ['with struck-through text']
              }
            ]
          }]
        }]
      });
    });
  });
});
