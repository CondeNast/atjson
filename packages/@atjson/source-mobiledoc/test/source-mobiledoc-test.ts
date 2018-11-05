import { HIR } from '@atjson/hir';
import MobiledocSource from '../src';

describe('@atjson/source-mobiledoc', () => {
  test('pre-code', () => {
    let doc = MobiledocSource.fromSource({ "version": "0.3.1", "atoms": [], "cards": [], "markups": [], "sections": [ [ 1, "p", [ [ 0, [], 0, "hello" ] ] ] ] });
    let hir = new HIR(doc).toJSON();

    expect(hir).toMatchObject({
      type: 'root',
      attributes: {},
      children: [{
        type: 'paragraph',
        attributes: {},
        children: ['Hello']
      }]
    });
  });
});