import TestSource, { Bold, CaptionSource, Image, Italic } from './test-source';

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
      annotations: [new Bold({
        start: 0,
        end: 2,
        attributes: {}
      })]
    })).toBeDefined();
  });

  test('clone', () => {
    let document = new TestSource({
      content: 'Hello World.',
      annotations: [new Bold({
        start: 0,
        end: 2,
        attributes: {}
      })]
    });
    let clone = document.clone();
    let [bold] = document.annotations;
    let [cloneBold] = clone.annotations;

    expect(clone).toBeInstanceOf(TestSource);
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
        id: '1',
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
    expect(image.attributes.caption).toBeInstanceOf(CaptionSource);
    expect(italic).toBeInstanceOf(Italic);
    expect(image.attributes.caption.content).toEqual('An example caption');
  });

  describe('match', () => {
    let document = new TestSource({
      content: 'Kublai Khan does not necessarily believe everything Marco \
        Polo says when he describes the cities visited on his expeditions, but the emperor of the Tartars does continue listening \
        to the young Venetian with greater attention and curiosity \
        than he shows any other messenger or explorer of his. In the \
        lives of emperors there is a moment which follows pride in \
        the boundiess extension of the territories we have conquered, \
        and the melancholy and relief of knowing we shall soon \
        give up any thought of knowing and understanding them.\
        \u000B\u000B\
        There is a sense of emptiness that comes over us at evening, \
        with the odor of the elephants after the rain and the sandalwood \
        ashes growing cold in the braziers, a dizziness that \
        makes rivers and mountains tremble on the fallow curves of \
        the planispheres where they are portrayed, and rolls up, one \
        after the other, the despatches announcing to us the collapse \
        of the last enemy troops, from defeat to defeat, and flakes \
        the wax of the seals of obscure kings who beseech our \
        armies\' protection, offering in exchange annual tributes of \
        precious metals, tanned hides, anti tortoise shell.\
        \u220E',
      annotations: []
    });

    const MATCHES_AND = [
      { start: 241, end: 244 },
      { start: 469, end: 472 },
      { start: 488, end: 491 },
      { start: 563, end: 566 },
      { start: 574, end: 577 },
      { start: 719, end: 722 },
      { start: 728, end: 731 },
      { start: 820, end: 823 },
      { start: 917, end: 920 },
      { start: 1062, end: 1065 }
    ];

    test('non-global regex returns first match', () => {
      expect(document.match(/and/)).toEqual(MATCHES_AND.slice(0,1));
    });

    test('global regex returns all matches', () => {
      expect(document.match(/and/g)).toEqual(MATCHES_AND);
    });

    test('match groups are ok but don\'t affect matches returned', () => {
      expect(document.match(/(a)(nd)+/g)).toEqual(MATCHES_AND);
    });

    test('regex can contain unicode characters', () => {
      expect(document.match(/[\u000B\u220E]/g)).toEqual([
        { start: 594, end: 595 },
        { start: 595, end: 596 },
        { start: 1270, end: 1271 }
      ]);
    });

    test('match finds within ranges', () => {
      expect(document.match(/and/g, undefined, 500)).toEqual(MATCHES_AND.slice(0, 3));
      expect(document.match(/and/g, 500)).toEqual(MATCHES_AND.slice(3));
      expect(document.match(/and/g, 500, 505)).toEqual([]);
      expect(document.match(/and/g, 500, 800)).toEqual(MATCHES_AND.slice(3, 7));
    });
  });

  describe('slice', () => {
    let document = new TestSource({
      content: 'Hello, world!\n\uFFFC',
      annotations: [{
        id: '1',
        type: '-test-bold',
        start: 0,
        end: 5,
        attributes: {}
      }, {
        id: '2',
        type: '-test-italic',
        start: 0,
        end: 13,
        attributes: {}
      }, {
        id: '3',
        type: '-test-underline',
        start: 0,
        end: 13,
        attributes: {}
      }, {
        id: '4',
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
        schema: ['-test-a', '-test-bold', '-test-code', '-test-image', '-test-instagram', '-test-italic', '-test-locale', '-test-manual', '-test-paragraph', '-test-pre'],
        annotations: [{
          id: '1',
          type: '-test-bold',
          start: 0,
          end: 4,
          attributes: {}
        }, {
          id: '2',
          type: '-test-italic',
          start: 0,
          end: 12,
          attributes: {}
        }, {
          id: '3',
          type: '-test-underline',
          start: 0,
          end: 12,
          attributes: {}
        }, {
          id: '4',
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
        schema: ['-test-a', '-test-bold', '-test-code', '-test-image', '-test-instagram', '-test-italic', '-test-locale', '-test-manual', '-test-paragraph', '-test-pre'],
        annotations: [{
          id: '1',
          type: '-test-bold',
          start: 0,
          end: 5,
          attributes: {}
        }, {
          id: '2',
          type: '-test-italic',
          start: 0,
          end: 13,
          attributes: {}
        }, {
          id: '3',
          type: '-test-underline',
          start: 0,
          end: 13,
          attributes: {}
        }, {
          id: '4',
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
