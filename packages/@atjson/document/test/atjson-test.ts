import TestSource from './test-source';

describe('new Document', () => {
  test('constructor accepts an object', () => {
    expect(new TestSource({
      content: 'Hello World.',
      annotations: []
    })).toBeDefined();
  });

  test('constructor will set annotations', () => {
    expect(new TestSource({
      content: 'Hello World.',
      annotations: [{
        type: '-test-bold',
        start: 0,
        end: 2,
        attributes: {}
      }]
    })).toBeDefined();
  });

  describe('slice', () => {
    let document = new TestSource({
      content: 'Hello, world!\n\uFFFC',
      annotations: [{
        type: '-test-bold',
        start: 0,
        end: 5,
        attributes: {}
      }, {
        type: '-test-italic',
        start: 0,
        end: 13,
        attributes: {}
      }, {
        type: '-test-underline',
        start: 0,
        end: 13,
        attributes: {}
      }, {
        type: '-test-instagram',
        start: 14,
        end: 15,
        attributes: {
          '-test-uri': 'https://www.instagram.com/p/BeW0pqZDUuK/'
        }
      }]
    });

    test('source documents are unaltered', () => {
      let doc = document.slice(1, 15);

      expect(doc.toJSON()).toEqual({
        content: 'ello, world!\n\uFFFC',
        contentType: 'application/vnd.atjson+test',
        schema: ['-test-a', '-test-bold', '-test-code', '-test-instagram', '-test-italic', '-test-locale', '-test-manual', '-test-pre'],
        annotations: [{
          type: '-test-bold',
          start: 0,
          end: 4,
          attributes: {}
        }, {
          type: '-test-italic',
          start: 0,
          end: 12,
          attributes: {}
        }, {
          type: '-test-underline',
          start: 0,
          end: 12,
          attributes: {}
        }, {
          type: '-test-instagram',
          start: 13,
          end: 14,
          attributes: {
            '-test-uri': 'https://www.instagram.com/p/BeW0pqZDUuK/'
          }
        }]
      });

      expect(document.toJSON()).toEqual({
        content: 'Hello, world!\n\uFFFC',
        contentType: 'application/vnd.atjson+test',
        schema: ['-test-a', '-test-bold', '-test-code', '-test-instagram', '-test-italic', '-test-locale', '-test-manual', '-test-pre'],
        annotations: [{
          type: '-test-bold',
          start: 0,
          end: 5,
          attributes: {}
        }, {
          type: '-test-italic',
          start: 0,
          end: 13,
          attributes: {}
        }, {
          type: '-test-underline',
          start: 0,
          end: 13,
          attributes: {}
        }, {
          type: '-test-instagram',
          start: 14,
          end: 15,
          attributes: {
            '-test-uri': 'https://www.instagram.com/p/BeW0pqZDUuK/'
          }
        }]
      });
    });
  });
});
