import { HIR } from '@atjson/hir';
import CommonMarkSource, { schema } from '../src/index';
import { render } from './utils';

describe('whitespace', () => {
  test('&nbsp; is translated to a non-breaking space', () => {
    let doc = new CommonMarkSource('&nbsp;');
    expect(render(doc)).toBe('\u00A0\n\n');
  });

  test('  \\n is converted to a hardbreak', () => {
    let doc = new CommonMarkSource('1  \n2');
    expect(render(doc)).toBe('1\n2\n\n');
  });

  test('non-breaking space unicode characters are converted to fixed-space annotations', () => {
    let doc = new CommonMarkSource('1\n\n\u202F\n\n2');
    let hir = new HIR(doc);
    expect(hir.toJSON()).toEqual({
      type: 'root',
      attributes: {},
      children: [{
        type: 'paragraph',
        attributes: {},
        children: ['1']
      }, {
        type: 'paragraph',
        attributes: {},
        children: ['\u00A0']
      }, {
        type: 'paragraph',
        attributes: {},
        children: ['2']
      }]
    });
  });
});

describe('code blocks', () => {
  test('` `` ` is converted to an inline code block', () => {
    let doc = new CommonMarkSource('` `` `');
    expect(render(doc)).toBe(' `` \n\n');
  });
});

describe('list', () => {
  test('nested lists', () => {
    let doc = new CommonMarkSource('- 1\n  - 2\n    - 3');
    expect(render(doc)).toBe('1\n2\n3\n');
  });

  test('tight', () => {
    let tight = new CommonMarkSource('- 1\n  - 2\n    - 3');
    let list = tight.annotations.find(annotation => annotation.type === 'bullet_list');
    expect(list.attributes).toEqual({ tight: true });

    let loose = new CommonMarkSource('1. 1\n\n  2. 2\n    3. 3');
    list = loose.annotations.find(annotation => annotation.type === 'ordered_list');
    expect(list.attributes).toEqual({ tight: false });
  });
});
