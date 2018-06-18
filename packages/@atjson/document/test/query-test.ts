import Document from '@atjson/document';

describe.skip('Document.where', () => {
  it('runs queries against existing annotations', () => {
    let doc = new Document({
      content: 'Hello',
      annotations: [{
        type: 'strong',
        start: 0,
        end: 5
      }, {
        type: 'em',
        start: 0,
        end: 5
      }]
    });

    doc.where({ type: 'strong' }).set({ type: 'bold' });
    doc.where({ type: 'em' }).set({ type: 'italic' });
    expect(doc.content).toBe('Hello');
    expect(doc.annotations).toEqual([{
      type: 'bold',
      start: 0,
      end: 5
    }, {
      type: 'italic',
      start: 0,
      end: 5
    }]);
  });

  it('runs queries against new annotations', () => {
    let doc = new Document({
      content: 'Hello',
      annotations: []
    });

    doc.where({ type: 'strong' }).set({ type: 'bold' });
    doc.where({ type: 'em' }).set({ type: 'italic' });
    doc.addAnnotations({
      type: 'strong',
      start: 0,
      end: 5
    }, {
      type: 'em',
      start: 0,
      end: 5
    });
    expect(doc.content).toBe('Hello');
    expect(doc.annotations).toEqual([{
      type: 'bold',
      start: 0,
      end: 5
    }, {
      type: 'italic',
      start: 0,
      end: 5
    }]);
  });

  it('set', () => {
    let doc = new Document({
      content: 'Hello',
      annotations: []
    });

    doc.where({ type: 'h1' }).set({ type: 'heading', attributes: { level: 1 } });
    doc.addAnnotations({
      type: 'h1',
      start: 0,
      end: 5
    });
    expect(doc.content).toBe('Hello');
    expect(doc.annotations).toEqual([{
      type: 'heading',
      attributes: {
        level: 1
      },
      start: 0,
      end: 5
    }]);
  });

  it('unset', () => {
    let doc = new Document({
      content: '\uFFFC\uFFFC',
      annotations: [{
        type: 'embed',
        attributes: {
          type: 'instagram',
          url: 'https://www.instagram.com/p/BeW0pqZDUuK/'
        },
        start: 0,
        end: 1
      }]
    });

    doc.where({ type: 'embed', attributes: { type: 'instagram' } }).set({ type: 'instagram' }).unset('attributes.type');
    doc.addAnnotations({
      type: 'embed',
      attributes: {
        type: 'instagram',
        url: 'https://www.instagram.com/p/BdyySYBDvpm/'
      },
      start: 1,
      end: 2
    });
    expect(doc.content).toBe('\uFFFC\uFFFC');
    expect(doc.annotations).toEqual([{
      type: 'instagram',
      attributes: {
        url: 'https://www.instagram.com/p/BeW0pqZDUuK/'
      },
      start: 0,
      end: 1
    }, {
      type: 'instagram',
      attributes: {
        url: 'https://www.instagram.com/p/BdyySYBDvpm/'
      },
      start: 1,
      end: 2
    }]);
  });

  it('rename', () => {
    let doc = new Document({
      content: 'Conde Nast',
      annotations: [{
        type: 'a',
        attributes: {
          href: 'https://example.com'
        },
        start: 0,
        end: 5
      }]
    });

    doc.where({ type: 'a' }).set({ type: 'link' }).rename({ attributes: { href: 'url' } });
    doc.addAnnotations({
      type: 'a',
      attributes: {
        href: 'https://condenast.com'
      },
      start: 6,
      end: 10
    });
    expect(doc.content).toBe('Conde Nast');
    expect(doc.annotations).toEqual([{
      type: 'link',
      attributes: {
        url: 'https://example.com'
      },
      start: 0,
      end: 5
    }, {
      type: 'link',
      attributes: {
        url: 'https://condenast.com'
      },
      start: 6,
      end: 10
    }]);
  });

  it('map', () => {
    let doc = new Document({
      content: 'Conde Nast',
      annotations: [{
        type: 'a',
        attributes: {
          href: 'https://example.com'
        },
        start: 0,
        end: 5
      }]
    });

    doc.where({ type: 'a' }).set({ type: 'link' }).map({ attributes: { href: 'url' } });
    doc.addAnnotations({
      type: 'a',
      attributes: {
        href: 'https://condenast.com'
      },
      start: 6,
      end: 10
    });
    expect(doc.content).toBe('Conde Nast');
    expect(doc.annotations).toEqual([{
      type: 'link',
      attributes: {
        url: 'https://example.com'
      },
      start: 0,
      end: 5
    }, {
      type: 'link',
      attributes: {
        url: 'https://condenast.com'
      },
      start: 6,
      end: 10
    }]);
  });

  it('map with function', () => {
    let doc = new Document({
      content: 'Conde Nast',
      annotations: [{
        type: 'a',
        attributes: {
          href: 'https://example.com'
        },
        start: 0,
        end: 5
      }]
    });

    doc.where({ type: 'a' }).map((annotation: Annotation) => {
      return {
        type: 'link',
        start: annotation.start,
        end: annotation.end,
        attributes: {
          url: annotation.attributes.href,
          openInNewTab: true
        }
      };
    });
    doc.addAnnotations({
      type: 'a',
      attributes: {
        href: 'https://condenast.com'
      },
      start: 6,
      end: 10
    });
    expect(doc.content).toBe('Conde Nast');
    expect(doc.annotations).toEqual([{
      type: 'link',
      attributes: {
        url: 'https://example.com',
        openInNewTab: true
      },
      start: 0,
      end: 5
    }, {
      type: 'link',
      attributes: {
        url: 'https://condenast.com',
        openInNewTab: true
      },
      start: 6,
      end: 10
    }]);
  });

  it('remove', () => {
    let doc = new Document({
      content: 'function () {}',
      annotations: [{
        type: 'code',
        start: 0,
        end: 14
      }]
    });

    doc.where({ type: 'code' }).remove();
    doc.addAnnotations({
      type: 'code',
      start: 0,
      end: 14
    });
    expect(doc.content).toBe('function () {}');
    expect(doc.annotations).toEqual([]);
  });

  it('annotation expansion', () => {
    let doc = new Document({
      content: 'string.trim();\nstring.strip',
      annotations: [{
        type: 'code',
        start: 0,
        end: 14,
        attributes: {
          class: 'language-js',
          language: 'js'
        }
      }]
    });

    doc.where({ type: 'code' }).map((annotation: Annotation) => {
      return [{
        type: 'pre',
        start: annotation.start,
        end: annotation.end,
        attributes: annotation.attributes
      }, {
        type: 'code',
        start: annotation.start,
        end: annotation.end,
        attributes: {}
      }];
    }).unset('attributes.class');

    doc.addAnnotations({
      type: 'code',
      start: 16,
      end: 28,
      attributes: {
        class: 'language-rb',
        language: 'rb'
      }
    });

    expect(doc.content).toBe('string.trim();\nstring.strip');
    expect(doc.annotations).toEqual([{
      type: 'pre',
      start: 0,
      end: 14,
      attributes: {
        language: 'js'
      }
    }, {
      type: 'code',
      start: 0,
      end: 14,
      attributes: {}
    }, {
      type: 'pre',
      start: 16,
      end: 28,
      attributes: {
        language: 'rb'
      }
    }, {
      type: 'code',
      start: 16,
      end: 28,
      attributes: {}
    }]);
  });

  it('sliced documents inherit queries', () => {
    let doc = new Document({
      content: 'This is ~my caption~\nNext paragraph',
      annotations: [{
        type: 'photo',
        start: 0,
        end: 20
      }]
    });

    doc.where({ type: 'em' }).set({ type: 'italic' });
    let caption = doc.slice(0, 20);
    caption.addAnnotations({
      type: 'em',
      start: 0,
      end: 4
    });
    expect(caption.content).toBe('This is ~my caption~');
    expect(doc.annotations).toEqual([{
      type: 'photo',
      start: 0,
      end: 20
    }, {
      type: 'italic',
      start: 0,
      end: 4
    }]);
  });
});
