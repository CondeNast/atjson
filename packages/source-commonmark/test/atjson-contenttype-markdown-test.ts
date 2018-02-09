import CommonMarkSource from '@atjson/source-commonmark';

describe('markdown -> atjson', () => {
  it('Correctly obtains annotations for simple inline elements', () => {
    let markdown = '*hello* __world__';
    let expectedAnnotations = [
      { type: 'p', start: 0, end: 11, attributes: {} },
      { type: 'em', start: 0, end: 5, attributes: {} },
      { type: 'strong', start: 6, end: 11, attributes: {} }
    ];

    let parser = new CommonMarkSource(markdown);
    let atjson = parser.toAtJSON();
    expect(atjson.annotations).toEqual(expectedAnnotations);
  });

  it('Correctly handles multiple paragraphs', () => {
    let markdown = '12345\n\n\n678\n910\n\neleventwelve\n\n';

    let expectedAnnotations = [
      { type: 'p', start: 0, end: 5, attributes: {} },
      { type: 'p', start: 6, end: 13, attributes: {} },
      { type: 'p', start: 14, end: 26, attributes: {} }
    ];

    let parser = new CommonMarkSource(markdown);
    let atjson = parser.toAtJSON();
    expect(atjson.content).toBe('12345\n678\n910\neleventwelve\n');
    expect(atjson.annotations).toEqual(expectedAnnotations);
  });

  it('Correctly handles escape sequences', () => {
    let markdown = 'foo __\\___';
    let expectedAnnotations = [
      { type: 'p', start: 0, end: 5, attributes: {} },
      { type: 'strong', start: 4, end: 5, attributes: {} }
    ];

    let parser = new CommonMarkSource(markdown);
    let atjson = parser.toAtJSON();

    expect(atjson.content).toBe('foo _\n');
    expect(atjson.annotations).toEqual(expectedAnnotations);
  });

  it('Correctly handles simple code spans', () => {
    let markdown = '`a b`';

    let expectedAnnotations = [
      { type: 'p', start: 0, end: 3, attributes: {} },
      { type: 'code', start: 0, end: 3, attributes: {} }
    ];

    let parser = new CommonMarkSource(markdown);
    let atjson = parser.toAtJSON();

    expect(atjson.content).toBe('a b\n');
    expect(atjson.annotations).toEqual(expectedAnnotations);
  });

  it('`` foo ` bar  ``', () => {
    let markdown = '`` foo ` bar  ``';
    let expectedAnnotations = [
      { type: 'p', start: 0, end: 9, attributes: {} },
      { type: 'code', start: 0, end: 9, attributes: {} }
    ];
    let parser = new CommonMarkSource(markdown);
    let atjson = parser.toAtJSON();
    expect(atjson.content).toBe('foo ` bar\n');
    expect(atjson.annotations).toEqual(expectedAnnotations);
  });

  it('links', () => {
    let markdown = '[link](/url "title")\n[link](/url \'title\')\n[link](/url (title))';
    let expectedAnnotations = [
      { type: 'p', start: 0, end: 14, attributes: {} },
      { type: 'a', start: 0, end: 4, attributes: { href: '/url', title: 'title' } },
      { type: 'a', start: 5, end: 9, attributes: { href: '/url', title: 'title' } },
      { type: 'a', start: 10, end: 14, attributes: { href: '/url', title: 'title' } }
    ];

    let parser = new CommonMarkSource(markdown);
    let atjson = parser.toAtJSON();
    expect(atjson.content).toBe('link\nlink\nlink\n');
    expect(atjson.annotations).toEqual(expectedAnnotations);
  });

  it('An ordered list with an embedded blockquote', () => {

    let markdown = '1.  A paragraph\n    with two lines.\n\n        indented code\n\n    > A block quote.';

    let parser = new CommonMarkSource(markdown);
    let atjson = parser.toAtJSON();

    let c = atjson.content;
    let expectedAnnotations = [
      { type: 'ol', start: 0, end: c.length - 1, attributes: {} },
      { type: 'li', start: 1, end: c.length - 2, attributes: {} },
      { type: 'p', start: 2, end: c.indexOf('nes.') + 4, attributes: {} },
      { type: 'pre', start: c.indexOf('inden'), end: c.indexOf('code\n') + 5, attributes: {} },
      { type: 'code', start: c.indexOf('inden'), end: c.indexOf('code\n') + 5, attributes: {} },
      { type: 'blockquote', start: c.indexOf('\nA block'), end: c.indexOf('quote.\n') + 7, attributes: {} },
      { type: 'p', start: c.indexOf('A block'), end: c.indexOf('quote.') + 6, attributes: {} }
    ];

    expect(atjson.content.replace(/\n/g, 'Z')).toBe('\n\nA paragraph\nwith two lines.\nindented code\n\n\nA block quote.\n\n\n\n'.replace(/\n/g, 'Z'));
    expect(atjson.annotations).toEqual(expectedAnnotations);
  });

  it('html blocks', () => {
    let markdown = '<DIV CLASS="foo">\n<p><em>Markdown</em></p>\n</DIV>';

    let parser = new CommonMarkSource(markdown);
    let atjson = parser.toAtJSON();

    expect(atjson.content).toBe('<DIV CLASS="foo">\n<p><em>Markdown</em></p>\n</DIV>\n');
    expect(atjson.annotations).toEqual([{ type: 'html', start: 0, end: 49, attributes: {} }]);
  });

  it('tabs', () => {
    let markdown = '\tfoo\tbaz\t\tbim';

    let parser = new CommonMarkSource(markdown);
    let atjson = parser.toAtJSON();

    expect(atjson.content).toBe('foo\tbaz\t\tbim\n');
  });

  it('hr', () => {
    let markdown = '*\t*\t*\t\n';

    let parser = new CommonMarkSource(markdown);
    let atjson = parser.toAtJSON();

    expect(atjson.content).toBe('\n');
  });

  it('simple images', () => {
    let markdown = '![foo](/url "title")';

    let parser = new CommonMarkSource(markdown);
    let atjson = parser.toAtJSON();

    expect(atjson.content).toBe('\n');

    let expectedAnnotations = [
      { type: 'p', start: 0, end: 0, attributes: {} },
      { type: 'img', start: 0, end: 0, attributes: { src: '/url', title: 'title', alt: 'foo' } }
    ];

    expect(atjson.annotations).toEqual(expectedAnnotations);
  });

  it('Does not add extra paragraphs within list items', () => {
    let markdown = '- foo\n-\n- bar\n';

    let parser = new CommonMarkSource(markdown);
    let atjson = parser.toAtJSON();

    expect(atjson.content).toBe('\nfoo\n\nbar\n\n');

    let expectedAnnotations = [
      { type: 'ul', start: 0, end: atjson.content.length - 1, attributes: {} },
      { type: 'li', start: 1, end: 4, attributes: {} },
      { type: 'li', start: 5, end: 5, attributes: {} },
      { type: 'li', start: 6, end: atjson.content.length - 2, attributes: {} }
    ];

    expect(atjson.annotations).toEqual(expectedAnnotations);
  });

  it('fenced code blocks2', () => {
    let markdown = '``` ```\naaa\n';

    let parser = new CommonMarkSource(markdown);
    let atjson = parser.toAtJSON();

    expect(atjson.content).toBe('\naaa\n');

    let expectedAnnotations = [
      { type: 'p', start: 0, end: atjson.content.length - 1, attributes: {} },
      { type: 'code', start: 0, end: 0, attributes: {} }
    ];

    expect(atjson.annotations).toEqual(expectedAnnotations);
  });
});
