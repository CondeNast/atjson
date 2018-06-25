import { AnnotationJSON, Attributes } from '../src';
import TestSource, { Anchor } from './test-source';

describe('Document.where', () => {
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


    doc.where({ type: '-test-h1' }).set({ type: '-test-heading', attributes: { '-test-level': 1 } });
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

    doc.where({ type: '-test-a' }).update((anchor: Anchor) => {
      let href = anchor.attributes.href;
      doc.replaceAnnotation(anchor, {
        type: '-test-link',
        start: anchor.start,
        end: anchor.end,
        attributes: {
          '-test-url': href.replace('http://', 'https://')
        }
      });
    });

    expect(doc.content).toBe('Conde Nast');
    expect(doc.annotations.map(a => a.toJSON())).toEqual([{
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
      let annotations = doc.replaceAnnotation(annotation, {
        type: '-test-pre',
        start: annotation.start,
        end: annotation.end,
        attributes: annotation.toJSON().attributes as Attributes
      }, {
        type: '-test-code',
        start: annotation.start,
        end: annotation.end,
        attributes: {}
      });

      return {
        add: annotations,
        remove: [annotation]
      };
    }).unset('attributes.-test-class');

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

  describe('AnnotationCollection.join', () => {
    test('simple join', () => {
      let doc = new TestSource({
        content: 'string.trim();\nstring.strip\nextra',
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
          type: '-test-pre',
          start: 0,
          end: 14,
          attributes: {}
        },
        {
          type: '-test-pre',
          start: 16,
          end: 28,
          attributes: {}
        },
        {
          type: '-test-code',
          start: 30,
          end: 35,
          attributes: {}
        }]
      });
      let codeBlocks = doc.where({ type: '-test-code' }).as('code');
      let preformattedText = doc.where({ type: '-test-pre' }).as('pre');
      let preAndCode = codeBlocks.join(preformattedText, (l, r) => l.start === r.start && l.end === r.end);

      expect(preAndCode.toJSON()).toEqual([{
        code: {
          type: '-test-code',
          start: 0,
          end: 14,
          attributes: {
            '-test-class': 'language-js',
            '-test-language': 'js'
          }
        },
        pre: [{
          type: '-test-pre',
          start: 0,
          end: 14,
          attributes: {}
        }]
      }]);

      preAndCode.update(({ code, pre }) => {
        doc.removeAnnotation(pre[0]);
        code.attributes.textStyle = 'pre';
        doc.deleteText(2, 4);
      });

      expect(doc.annotations.map(a => a.toJSON())).toEqual([{
        type: '-test-code',
        start: 0,
        end: 12,
        attributes: {
          '-test-class': 'language-js',
          '-test-language': 'js',
          '-test-textStyle': 'pre'
        }
      }, {
        type: '-test-pre',
        start: 14,
        end: 26,
        attributes: {}
      }, {
        type: '-test-code',
        end: 33,
        start: 28,
        attributes: {}
      }]);
    });

    test('complex (three-way) join', () => {
      let doc = new TestSource({
        content: 'string.trim();\nstring.strip\nextra',
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
          type: '-test-pre',
          start: 0,
          end: 14,
          attributes: {}
        },
        {
          type: '-test-pre',
          start: 16,
          end: 28,
          attributes: {}
        },
        {
          type: '-test-code',
          start: 30,
          end: 35,
          attributes: {}
        }, {
          type: '-test-locale',
          start: 0,
          end: 14,
          attributes: { '-test-locale': 'en-us' }
        }, {
          type: '-test-pre',
          start: 0,
          end: 14,
          attributes: { '-test-style': 'color: red' }
        }]
      });

      let codeBlocks = doc.where({ type: '-test-code' }).as('code');
      let preformattedText = doc.where({ type: '-test-pre' }).as('preElements');
      let locales = doc.where({ type: '-test-locale' }).as('locale');

      let threeWayJoin = codeBlocks.join(preformattedText, (l, r) => l.start === r.start && l.end === r.end)
                                   .join(locales, (l, r) => l.code.start === r.start && l.code.end === r.end);

      expect(threeWayJoin.toJSON()).toEqual([{
        code: {
          type: '-test-code',
          start: 0,
          end: 14,
          attributes: {
            '-test-class': 'language-js',
            '-test-language': 'js'
          }
        },
        preElements: [{
          type: '-test-pre',
          start: 0,
          end: 14,
          attributes: {}
        }, {
          type: '-test-pre',
          start: 0,
          end: 14,
          attributes: {
            '-test-style': 'color: red'
          }
        }],
        locale: [{
          type: '-test-locale',
          start: 0,
          end: 14,
          attributes: {
            '-test-locale': 'en-us'
          }
        }]
      }]);

      threeWayJoin.update(({ code, preElements, locale }) => {
        doc.insertText(0, 'Hello!\n');

        let newAttributes: any = {};
        preElements.forEach(pre => {
          Object.assign(newAttributes, pre.attributes);
          doc.removeAnnotation(pre);
        });
        newAttributes.locale = locale[0].attributes.locale;
        doc.removeAnnotation(locale[0]);

        let newCode = Object.assign(code, {
          attributes: Object.assign(code.attributes, newAttributes)
        });
        doc.replaceAnnotation(code, newCode.toJSON() as AnnotationJSON);
      });

      expect(doc.annotations.map(a => a.toJSON())).toEqual([{
        type: '-test-code',
        start: 7,
        end: 21,
        attributes: {
          '-test-class': 'language-js',
          '-test-language': 'js',
          '-test-locale': 'en-us',
          '-test-style': 'color: red'
        }
      }, {
        type: '-test-pre',
        start: 23,
        end: 35,
        attributes: {}
      }, {
        type: '-test-code',
        start: 37,
        end: 42,
        attributes: {}
      }]);
    });
  });
});
