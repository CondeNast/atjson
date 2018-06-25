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
      content: 'Hello, world!',
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
      }]
    });

    test('source documents are unaltered', () => {
      let doc = document.slice(1, 13);
      expect(doc.content).toBe('ello, world!');

      expect(doc.toJSON()).toEqual({
        content: 'ello, world!',
        contentType: 'application/vnd.atjson+test',
        schema: ['-test-bold', '-test-instagram', '-test-italic', '-test-manual'],
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
        }]
      });

      expect(document.toJSON()).toEqual({
        content: 'Hello, world!',
        contentType: 'application/vnd.atjson+test',
        schema: ['-test-bold', '-test-instagram', '-test-italic', '-test-manual'],
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
        }]
      });
    });
  });
});
