import { InlineAnnotation } from '@atjson/document';
import { HIR } from '@atjson/hir';
import MobileDocSource from '../src';

describe('@atjson/source-mobiledoc', () => {
  test('paragraph', () => {
    let doc = MobileDocSource.fromSource({
      version: '0.3.1',
      atoms: [],
      cards: [],
      markups: [],
      sections: [
        [ 1, 'p', [ [ 0, [], 0, 'hello' ] ] ]
      ]
    });
    let hir = new HIR(doc).toJSON();

    expect(hir).toMatchObject({
      type: 'root',
      attributes: {},
      children: [{
        type: 'p',
        attributes: {},
        children: ['hello']
      }]
    });
  });

  test('markup', () => {
    let doc = MobileDocSource.fromSource({
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
            [0, [1], 0, 'hello'],     // a tag open
            [0, [0], 1, 'brave new'], // b tag open/close
            [0, [], 1, 'world']       // a tag close
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
          children: ['hello', {
            type: 'b',
            attributes: {},
            children: ['brave new']
          }, 'world']
        }]
      }]
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

    class MentionSource extends MobileDocSource {
      static schema = [...MobileDocSource.schema, Mention];
    }

    let doc = MentionSource.fromSource({
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

  describe('list', () => {
    test.each(['ol', 'ul'])('%s', type => {
      let doc = MobileDocSource.fromSource({
        version: '0.3.1',
        atoms: [],
        cards: [],
        markups: [],
        sections: [
          [3, type, [
            [[0, [], 0, 'first item']],
            [[0, [], 0, 'second item']]
          ]]
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
            children: ['first item']
          }, {
            type: 'li',
            attributes: {},
            children: ['second item']
          }]
        }]
      });
    });
  });
});
