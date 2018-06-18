import { AnnotationJSON } from '../src';
import TestSource from './test-source';

describe('Document.where', () => {
  it('runs queries against existing annotations', () => {
    let doc = new TestSource({
      content: 'Hello',
      annotations: [{
        type: '-test-strong',
        start: 0,
        end: 5,
        attributes: {}
      }, {
        type: '-test-em',
        start: 0,
        end: 5,
        attributes: {}
      }]
    });

    doc.where({ type: '-test-strong' }).set({ type: '-test-bold' });
    doc.where({ type: '-test-em' }).set({ type: '-test-italic' });
    expect(doc.content).toBe('Hello');

    expect(doc.annotations.map(a => a.toJSON())).toEqual([{
      type: '-test-bold',
      start: 0,
      end: 5,
      attributes: {}
    }, {
      type: '-test-italic',
      start: 0,
      end: 5,
      attributes: {}
    }]);
  });

  it('runs queries against new annotations', () => {
    let doc = new TestSource({
      content: 'Hello',
      annotations: []
    });

    doc.where({ type: '-test-strong' }).set({ type: '-test-bold' });
    doc.where({ type: '-test-emphasis' }).set({ type: '-test-italic' });
    doc.addAnnotations({
      type: '-test-strong',
      start: 0,
      end: 5,
      attributes: {}
    }, {
      type: '-test-emphasis',
      start: 0,
      end: 5,
      attributes: {}
    });
    expect(doc.content).toBe('Hello');
    expect(doc.annotations.map(a => a.toJSON())).toEqual([{
      type: '-test-bold',
      start: 0,
      end: 5,
      attributes: {}
    }, {
      type: '-test-italic',
      start: 0,
      end: 5,
      attributes: {}
    }]);
  });

  it('set', () => {
    let doc = new TestSource({
      content: 'Hello',
      annotations: []
    });

    doc.where({ type: '-test-h1' }).set({ type: '-test-heading', attributes: { '-test-level': 1 } });
    doc.addAnnotations({
      type: '-test-h1',
      start: 0,
      end: 5,
      attributes: {}
    });
    expect(doc.content).toBe('Hello');
    expect(doc.annotations.map(a => a.toJSON())).toEqual([{
      type: '-test-heading',
      attributes: {
        '-test-level': 1
      },
      start: 0,
      end: 5
    }]);
  });

  it('unset', () => {
    let doc = new TestSource({
      content: '\uFFFC\uFFFC',
      annotations: [{
        type: '-test-social',
        attributes: {
          '-test-type': 'instagram',
          '-test-uri': 'https://www.instagram.com/p/BeW0pqZDUuK/'
        },
        start: 0,
        end: 1
      }]
    });

    doc.where({ type: '-test-social', attributes: { '-test-type': 'instagram' } }).set({ type: '-test-instagram' }).unset('attributes.-test-type');
    doc.addAnnotations({
      type: '-test-social',
      attributes: {
        '-test-type': 'instagram',
        '-test-uri': 'https://www.instagram.com/p/BdyySYBDvpm/'
      },
      start: 1,
      end: 2
    });
    expect(doc.content).toBe('\uFFFC\uFFFC');
    expect(doc.annotations.map(a => a.toJSON())).toEqual([{
      type: '-test-instagram',
      attributes: {
        '-test-uri': 'https://www.instagram.com/p/BeW0pqZDUuK/'
      },
      start: 0,
      end: 1
    }, {
      type: '-test-instagram',
      attributes: {
        '-test-uri': 'https://www.instagram.com/p/BdyySYBDvpm/'
      },
      start: 1,
      end: 2
    }]);
  });

  it('rename', () => {
    let doc = new TestSource({
      content: 'Conde Nast',
      annotations: [{
        type: '-test-a',
        attributes: {
          '-test-href': 'https://example.com'
        },
        start: 0,
        end: 5
      }]
    });

    doc.where({ type: '-test-a' }).set({ type: '-test-link' }).rename({ attributes: { '-test-href': '-test-url' } });
    doc.addAnnotations({
      type: '-test-a',
      attributes: {
        '-test-href': 'https://condenast.com'
      },
      start: 6,
      end: 10
    });
    expect(doc.content).toBe('Conde Nast');
    expect(doc.annotations.map(a => a.toJSON())).toEqual([{
      type: '-test-link',
      attributes: {
        '-test-url': 'https://example.com'
      },
      start: 0,
      end: 5
    }, {
      type: '-test-link',
      attributes: {
        '-test-url': 'https://condenast.com'
      },
      start: 6,
      end: 10
    }]);
  });

  it('map with function', () => {
    let doc = new TestSource({
      content: 'Conde Nast',
      annotations: [{
        type: '-test-a',
        attributes: {
          '-test-href': 'http://example.com'
        },
        start: 0,
        end: 5
      }]
    });

    doc.where({ type: '-test-a' }).map((annotation: AnnotationJSON) => {
      let href = annotation.attributes['-test-href'] as string;
      return {
        type: '-test-link',
        start: annotation.start,
        end: annotation.end,
        attributes: {
          '-test-url': href.replace('http://', 'https://')
        }
      };
    });
    doc.addAnnotations({
      type: '-test-a',
      attributes: {
        '-test-href': 'http://condenast.com'
      },
      start: 6,
      end: 10
    });
    expect(doc.content).toBe('Conde Nast');
    expect(doc.annotations.map(a => a.toJSON())).toEqual([{
      type: '-test-link',
      attributes: {
        '-test-url': 'https://example.com'
      },
      start: 0,
      end: 5
    }, {
      type: '-test-link',
      attributes: {
        '-test-url': 'https://condenast.com'
      },
      start: 6,
      end: 10
    }]);
  });

  it('remove', () => {
    let doc = new TestSource({
      content: 'function () {}',
      annotations: [{
        type: '-test-code',
        start: 0,
        end: 14,
        attributes: {}
      }]
    });

    doc.where({ type: '-test-code' }).remove();
    doc.addAnnotations({
      type: '-test-code',
      start: 0,
      end: 14,
      attributes: {}
    });
    expect(doc.content).toBe('function () {}');
    expect(doc.annotations).toEqual([]);
  });

  it('annotation expansion', () => {
    let doc = new TestSource({
      content: 'string.trim();\nstring.strip',
      annotations: [{
        type: '-test-code',
        start: 0,
        end: 14,
        attributes: {
          '-test-class': 'language-js',
          '-test-language': 'js'
        }
      }]
    });

    doc.where({ type: '-test-code' }).map((annotation: AnnotationJSON) => {
      return [{
        type: '-test-pre',
        start: annotation.start,
        end: annotation.end,
        attributes: annotation.attributes
      }, {
        type: '-test-code',
        start: annotation.start,
        end: annotation.end,
        attributes: {}
      }];
    }).unset('attributes.-test-class');

    doc.addAnnotations({
      type: '-test-code',
      start: 16,
      end: 28,
      attributes: {
        '-test-class': 'language-rb',
        '-test-language': 'rb'
      }
    });

    expect(doc.content).toBe('string.trim();\nstring.strip');
    expect(doc.annotations.map(a => a.toJSON())).toEqual([{
      type: '-test-pre',
      start: 0,
      end: 14,
      attributes: {
        '-test-language': 'js'
      }
    }, {
      type: '-test-code',
      start: 0,
      end: 14,
      attributes: {}
    }, {
      type: '-test-pre',
      start: 16,
      end: 28,
      attributes: {
        '-test-language': 'rb'
      }
    }, {
      type: '-test-code',
      start: 16,
      end: 28,
      attributes: {}
    }]);
  });

  it('sliced documents inherit queries', () => {
    let doc = new TestSource({
      content: 'This is ~my caption~\nNext paragraph',
      annotations: [{
        type: '-test-photo',
        start: 0,
        end: 20,
        attributes: {}
      }]
    });

    doc.where({ type: '-test-em' }).set({ type: '-test-italic' });
    let caption = doc.slice(0, 20);
    caption.addAnnotations({
      type: '-test-em',
      start: 0,
      end: 4,
      attributes: {}
    });
    expect(caption.content).toBe('This is ~my caption~');
    expect(caption.annotations.map(a => a.toJSON())).toEqual([{
      type: '-test-photo',
      start: 0,
      end: 20,
      attributes: {}
    }, {
      type: '-test-italic',
      start: 0,
      end: 4,
      attributes: {}
    }]);
  });
});
