import Document from '@atjson/document';

describe('Document.where', () => {
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

    doc.where({ type: 'strong' }).set({ type: 'bold' }).done();
    doc.where({ type: 'em' }).set({ type: 'italic' }).done();
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

    doc.where({ type: 'strong' }).set({ type: 'bold' }).done();
    doc.where({ type: 'em' }).set({ type: 'italic' }).done();
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

    doc.where({ type: 'embed', attributes: { type: 'instagram' } }).set({ type: 'instagram' }).unset('attributes.type').done();
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

    doc.where({ type: 'a' }).set({ type: 'link' }).map({ 'attributes.href': 'attributes.url' }).done();
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

  it('remove', () => {
    let doc = new Document({
      content: 'function () {}',
      annotations: [{
        type: 'code',
        start: 0,
        end: 14
      }]
    });

    doc.where({ type: 'code' }).remove().done();
    doc.addAnnotations({
      type: 'code',
      start: 0,
      end: 14
    });
    expect(doc.content).toBe('function () {}');
    expect(doc.annotations).toEqual([]);
  });
});
