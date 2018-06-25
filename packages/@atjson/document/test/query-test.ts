import Document, { Annotation } from '../src/';

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

  it('set', () => {
    let doc = new Document({
      content: 'Hello',
      annotations: [{
        type: 'h1',
        start: 0,
        end: 5
      }]
    });

    doc.where({ type: 'h1' }).set({ type: 'heading', attributes: { level: 1 } });
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
      },
      {
        type: 'embed',
        attributes: {
          type: 'instagram',
          url: 'https://www.instagram.com/p/BdyySYBDvpm/'
        },
        start: 1,
        end: 2
      }]
    });

    doc.where({ type: 'embed', attributes: { type: 'instagram' } }).set({ type: 'instagram' }).unset('attributes.type');
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
      },
      {
        type: 'a',
        attributes: {
          href: 'https://condenast.com'
        },
        start: 6,
        end: 10
      }]
    });

    doc.where({ type: 'a' }).set({ type: 'link' }).rename({ attributes: { href: 'url' } });
    doc.addAnnotations();
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

  it('update with function', () => {
    let doc = new Document({
      content: 'Conde Nast',
      annotations: [{
        type: 'a',
        attributes: {
          href: 'https://example.com'
        },
        start: 0,
        end: 5
      },
      {
        type: 'a',
        attributes: {
          href: 'https://condenast.com'
        },
        start: 6,
        end: 10
      }]
    });

    doc.where({ type: 'a' }).update(annotation => {
      doc.replaceAnnotation(annotation, {
        type: 'link',
        start: annotation.start,
        end: annotation.end,
        attributes: {
          url: annotation.attributes ? annotation.attributes.href : '',
          openInNewTab: true
        }
      });
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
      },
      {
        type: 'code',
        start: 0,
        end: 14
      }]
    });

    doc.where({ type: 'code' }).remove();
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
      },
      {
        type: 'code',
        start: 16,
        end: 28,
        attributes: {
          class: 'language-rb',
          language: 'rb'
        }
      }]
    });

    doc.where({ type: 'code' }).update(annotation => {
      let annotations = [{
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

      doc.replaceAnnotation(annotation, ...annotations);

      return {
        add: annotations,
        remove: [annotation]
      };
    }).unset('attributes.class');

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

  describe('AnnotationCollection.join', () => {
    test('simple join', () => {
      let doc = new Document({
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
          attributes: { }
        },
        {
          type: 'pre',
          start: 16,
          end: 28,
          attributes: { }
        },
        {
          type: 'code',
          start: 30,
          end: 35
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
        doc.deleteText({start: 2, end: 4} as Annotation);
      });

      expect(doc.annotations.filter(x => x.type === 'pre')).toEqual(
        [{ type: 'pre', start: 14, end: 26, attributes: {} }]
      );
    });

    test('complex (three-way) join', () => {
      let doc = new Document({
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
          attributes: { }
        },
        {
          type: 'pre',
          start: 16,
          end: 28,
          attributes: { }
        },
        {
          type: 'code',
          start: 30,
          end: 35
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
        pre.forEach((x: Annotation) => {
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
