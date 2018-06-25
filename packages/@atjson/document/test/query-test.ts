import { AnnotationJSON } from '../src';
import TestSource from './test-source';

describe.skip('Document.where', () => {
  it('runs queries against existing annotations', () => {
    let doc = new TestSource({
      content: 'Hello',
      annotations: [{
        type: '-test-strong',
        start: 0,
        end: 5,
        attributes: {}
      }, {
        type: '-test-emphasis',
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

  it('set', () => {
    let doc = new TestSource({
      content: 'Hello',
      annotations: [{
        type: '-test-h1',
        start: 0,
        end: 5,
        attributes: {}
      }]
    });

    doc.where({ type: '-test-h1' }).set({ type: '-test-heading', attributes: { level: 1 } });
    expect(doc.content).toBe('Hello');
    expect(doc.annotations).toEqual([{
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
      content: '\uFFFC',
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

    expect(doc.content).toBe('\uFFFC');
    expect(doc.annotations.map(a => a.toJSON())).toEqual([{
      type: '-test-instagram',
      attributes: {
        '-test-uri': 'https://www.instagram.com/p/BeW0pqZDUuK/'
      },
      start: 0,
      end: 1
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
      },
      {
        type: '-test-a',
        attributes: {
          '-test-href': 'https://condenast.com'
        },
        start: 6,
        end: 10
      }]
    });

    doc.where({ type: '-test-a' }).set({ type: '-test-link' }).rename({ attributes: { '-test-href': '-test-url' } });
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

  it('update with function', () => {
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

    doc.where({ type: '-test-a' }).update((annotation: AnnotationJSON) => {
      doc.replaceAnnotation(annotation, {
        type: '-test-link',
        start: annotation.start,
        end: annotation.end,
        attributes: {
          '-test-url': annotation.attributes['-test-href'].replace('http://', 'https://')
        }
      });
    });

    expect(doc.content).toBe('Conde Nast');
    expect(doc.annotations).toEqual([{
      type: '-test-link',
      attributes: {
        '-test-url': 'https://example.com'
      },
      start: 0,
      end: 5
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
      },
      {
        type: '-test-code',
        start: 16,
        end: 28,
        attributes: {
          '-test-class': 'language-rb',
          '-test-language': 'rb'
        }
      }]
    });

    doc.where({ type: '-test-code' }).update(annotation => {
      let annotations = [{
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

      doc.replaceAnnotation(annotation, ...annotations);

      return {
        add: annotations,
        remove: [annotation]
      };
    }).unset('attributes.-test-class');

    expect(doc.content).toBe('string.trim();\nstring.strip');
    expect(doc.annotations).toEqual([{
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
      type: 'code',
      start: 16,
      end: 28,
      attributes: {}
    }]);
  });

  describe('AnnotationCollection.join', () => {
    test('simple join', () => {
      let doc = new TestSource({
        content: 'string.trim();\nstring.strip\nextra',
        annotations: [{
          type: 'code',
          start: 0,
          end: 14,
          attributes: {
            class: 'language-js',
            language: 'js'
          }
        },
        {
          type: 'pre',
          start: 0,
          end: 14,
          attributes: {}
        },
        {
          type: 'pre',
          start: 16,
          end: 28,
          attributes: {}
        },
        {
          type: 'code',
          start: 30,
          end: 35,
          attributes:{}
        }]
      });
      let codeBlocks = doc.where({ type: 'code' }).as('code');
      let preformattedText = doc.where({ type: 'pre' }).as('pre');
      let preAndCode = codeBlocks.join(preformattedText, (l, r) => l.start === r.start && l.end === r.end);

      expect(preAndCode.toArray()).toEqual([{
        code: {
          type: 'code',
          start: 0,
          end: 14,
          attributes: {
            class: 'language-js',
            language: 'js'
          }
        },
        pre: [
          { type: 'pre', start: 0, end: 14, attributes: {} }
        ]
      }]);

      preAndCode.update(({ code, pre }) => {
        doc.removeAnnotation(pre[0]);

        let newAttributes = Object.assign(code.attributes, {
          textStyle: 'pre'
        });
        let newCode = Object.assign(code, { attributes: newAttributes });

        doc.replaceAnnotation(code, newCode);
        doc.deleteText(2, 4);
      });

      expect(doc.annotations.filter(x => x.type === 'pre')).toEqual(
        [{ type: 'pre', start: 14, end: 26, attributes: {} }]
      );
    });

    test('complex (three-way) join', () => {
      let doc = new TestSource({
        content: 'string.trim();\nstring.strip\nextra',
        annotations: [{
          type: 'code',
          start: 0,
          end: 14,
          attributes: {
            class: 'language-js',
            language: 'js'
          }
        },
        {
          type: 'pre',
          start: 0,
          end: 14,
          attributes: {}
        },
        {
          type: 'pre',
          start: 16,
          end: 28,
          attributes: {}
        },
        {
          type: 'code',
          start: 30,
          end: 35,
          attributes: {}
        }, {
          type: 'locale',
          start: 0,
          end: 14,
          attributes: { locale: 'en-us' }
        }, {
          type: 'pre',
          start: 0,
          end: 14,
          attributes: { style: 'color: red' }
        }]
      });

      let codeBlocks = doc.where({ type: 'code' }).as('code');
      let preformattedText = doc.where({ type: 'pre' }).as('pre');
      let locales = doc.where({ type: 'locale' }).as('locale');

      let threeWayJoin = codeBlocks.join(preformattedText, (l, r) => l.start === r.start && l.end === r.end)
                                   .join(locales, (l, r) => l.code.start === r.start && l.code.end === r.end);

      expect(threeWayJoin.toArray()).toEqual([{
        code: {
          type: 'code',
          start: 0,
          end: 14,
          attributes: {
            class: 'language-js',
            language: 'js'
          }
        },
        pre: [{
          type: 'pre',
          start: 0,
          end: 14,
          attributes: { }
        }, {
          type: 'pre',
          start: 0,
          end: 14,
          attributes: { style: 'color: red' }
        }],
        locale: [{
          type: 'locale',
          start: 0,
          end: 14,
          attributes: { locale: 'en-us' }
        }]
      }]);

      threeWayJoin.update(({ code, pre, locale }) => {
        doc.insertText(0, 'Hello!\n');

        let newAttributes = {};
        pre.forEach(x => {
          Object.assign(newAttributes, x.attributes);
          doc.removeAnnotation(x);
        });
        newAttributes = Object.assign(newAttributes, { locale: locale[0].attributes!.locale });
        doc.removeAnnotation(locale[0]);

        let newCode = Object.assign(code, {
          attributes: Object.assign(code.attributes, newAttributes)
        });
        doc.replaceAnnotation(code, newCode);
      });

      expect(doc.annotations).toEqual([
        {
          type: 'code', start: 7, end: 21, attributes: {
            class: 'language-js',
            language: 'js',
            locale: 'en-us',
            style: 'color: red'
          }
        },
        {
          type: 'pre', start: 23, end: 35, attributes: {}
        },
        {
          type: 'code', start: 37, end: 42
        }
      ]);
    });
  });
});
