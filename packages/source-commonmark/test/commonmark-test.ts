import CommonMarkSource, { schema } from '@atjson/source-commonmark';
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
    let list = tight.annotations.find(annotation => annotation.type === '-md-bullet_list');
    expect(list.attributes).toEqual({ tight: true });

    let loose = new CommonMarkSource('1. 1\n\n  2. 2\n    3. 3');
    list = loose.annotations.find(annotation => annotation.type === '-md-ordered_list');
    expect(list.attributes).toEqual({ tight: false });
  });
});
