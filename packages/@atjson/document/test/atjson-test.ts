
import TestSource, { Bold, Image, Italic } from './test-source';

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

  test('clone', () => {
    let document = new TestSource({
      content: 'Hello World.',
      annotations: [{
        type: '-test-bold',
        start: 0,
        end: 2,
        attributes: {}
      }]
    });
    let clone = document.clone();
    let [bold] = document.annotations;
    let [cloneBold] = clone.annotations;

    expect(document.content).toEqual(clone.content);
    expect(bold).not.toBe(cloneBold);
    expect(bold).toBeInstanceOf(Bold);
    expect(cloneBold).toBeInstanceOf(Bold);
    expect(document.toJSON()).toEqual(clone.toJSON());
  });

  test('nested documents', () => {
    let document = new TestSource({
      content: '\uFFFC',
      annotations: [{
        type: '-test-image',
        start: 0,
        end: 1,
        attributes: {
          '-test-url': 'http://www.example.com/test.jpg',
          '-test-caption': {
            content: 'An example caption',
            annotations: [{
              type: '-test-italic',
              start: 3,
              end: 10,
              attributes: {}
            }]
          }
        }
      }]
    });

    let image = document.annotations[0] as Image;
    let [italic] = image.attributes.caption.annotations;

    expect(document.content).toEqual('\uFFFC');
    expect(italic).toBeInstanceOf(Italic);
    expect(image.attributes.caption.content).toEqual('An example caption');
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
        schema: ['-test-bold', '-test-image', '-test-instagram', '-test-italic', '-test-manual'],
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
        schema: ['-test-bold', '-test-image', '-test-instagram', '-test-italic', '-test-manual'],
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
