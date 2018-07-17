import Document from '@atjson/document';
import { HIR } from '../src/index';
import TestSource from './test-source';
import { bold, document, image, italic, li, ol, paragraph, ul } from './utils';

describe('@atjson/hir', () => {

  /**
   * FIXME I don't know how to test types. This just throws in compile time,
   * but we should test that invalid objects are in fact caught by the compiler. ???
   *
  test('rejects invalid documents', () => {
    let invalidDoc = { blah: 'x' };
    expect(() => new HIR(invalidDoc)).toThrow();
  });
   */

  test('accepts atjson-shaped object', () => {
    let validDoc = new TestSource({
      content: 'test\ndocument\n\nnew paragraph',
      annotations: []
    });

    let expected = document('test\ndocument\n\nnew paragraph');
    expect(new HIR(validDoc)).toBeDefined();
    expect(new HIR(validDoc).toJSON()).toEqual(expected);
  });

  describe('constructs a valid hierarchy', () => {

    test('from a document without nesting', () => {
      let noNesting = new TestSource({
        content: 'A string with a bold and an italic annotation',
        annotations: [
          { type: '-test-bold', start: 16, end: 20, attributes: {} },
          { type: '-test-italic', start: 28, end: 34, attributes: {} }
        ]
      });

      let hir = new HIR(noNesting).toJSON();
      let expected = document(
        'A string with a ',
        bold('bold'),
        ' and an ',
        italic('italic'),
        ' annotation'
      );

      expect(hir).toEqual(expected);
    });

    test('from a document with nesting', () => {
      let nested = new TestSource({
        content: 'I have a list:\n\nFirst item plus bold text\n\n' +
                 'Second item plus italic text\n\nItem 2a\n\nItem 2b\n\nAfter all the lists',
        annotations: [
          { type: '-test-bold', start: 32, end: 36, attributes: {} },
          { type: '-test-italic', start: 60, end: 66, attributes: {} },
          { type: '-test-ordered-list', start: 16, end: 91, attributes: {} },
          { type: '-test-list-item', start: 16, end: 43, attributes: {} },
          { type: '-test-list-item', start: 43, end: 91, attributes: {} },
          { type: '-test-ordered-list', start: 73, end: 91, attributes: {} },
          { type: '-test-list-item', start: 73, end: 82, attributes: {} },
          { type: '-test-list-item', start: 82, end: 91, attributes: {} }
        ]
      });

      let expected = document(
        'I have a list:\n\n',
        ol(
          li('First item plus ', bold('bold'), ' text\n\n'),
          li('Second item plus ', italic('italic'), ' text\n\n',
            ol(
              li('Item 2a\n\n'),
              li('Item 2b\n\n')
            )
          )
        ),
        'After all the lists'
      );

      expect(new HIR(nested).toJSON()).toEqual(expected);
    });

    test('from a document with overlapping annotations at the same level', () => {
      let overlapping = new TestSource({
        content: 'Some text that is both bold and italic plus something after.',
        annotations: [
          { type: '-test-bold', start: 23, end: 31, attributes: {} },
          { type: '-test-italic', start: 28, end: 38, attributes: {} }
        ]
      });

      let expected = document(
        'Some text that is both ',
        bold('bold ', italic('and')),
        italic(' italic'),
        ' plus something after.'
      );

      expect(new HIR(overlapping).toJSON()).toEqual(expected);
    });

    test('from a document with overlapping annotations across heirarchical levels', () => {
      let spanning = new TestSource({
        content: 'A paragraph with some bold\n\ntext that continues into the next.',
        annotations: [
          { type: '-test-paragraph', start: 0, end: 28, attributes: {} },
          { type: '-test-paragraph', start: 28, end: 62, attributes: {} },
          { type: '-test-bold', start: 22, end: 32, attributes: {} }
        ]
      });

      let expected = document(
        paragraph(
          'A paragraph with some ',
          bold('bold\n\n'),
        ),
        paragraph(
          bold('text'),
          ' that continues into the next.'
        )
      );

      expect(new HIR(spanning).toJSON()).toEqual(expected);
    });

    test('from a zero-length document with annotations', () => {
      let zerolength = new TestSource({
        content: '',
        annotations: [
          { type: '-test-paragraph', start: 0, end: 0, attributes: {} },
          { type: '-test-bold', start: 0, end: 0, attributes: {} }
        ]
      });

      let expected = document(paragraph(bold()));

      expect(new HIR(zerolength).toJSON()).toEqual(expected);
    });

    test('from a document with zero-length paragraphs', () => {
      let zerolength = new TestSource({
        content: 'One fish\n\nTwo fish\n\n\n\nRed fish\n\nBlue fish',
        annotations: [
          { type: '-test-paragraph', start: 0, end: 8, attributes: {} },
          { type: '-atjson-parse-token', start: 8, end: 10, attributes: {} },
          { type: '-test-paragraph', start: 10, end: 18, attributes: {} },
          { type: '-atjson-parse-token', start: 18, end: 20, attributes: {} },
          { type: '-test-paragraph', start: 20, end: 22, attributes: {} },
          { type: '-atjson-parse-token', start: 20, end: 22, attributes: {} },
          { type: '-test-paragraph', start: 22, end: 30, attributes: {} },
          { type: '-atjson-parse-token', start: 30, end: 32, attributes: {} },
          { type: '-test-paragraph', start: 32, end: 41, attributes: {} }
        ]
      });

      let expected = document(
        paragraph('One fish'),
        paragraph('Two fish'),
        paragraph(),
        paragraph('Red fish'),
        paragraph('Blue fish')
      );

      expect(new HIR(zerolength).toJSON()).toEqual(expected);
    });

    test('from a document with a point annotation', () => {
      let zerolength = new TestSource({
        content: 'One fish\n\nTwo fish\n\n\n\nRed fish\n\nBlue fish',
        annotations: [
          { type: '-test-paragraph', start: 0, end: 8, attributes: {} },
          { type: '-atjson-parse-token', start: 8, end: 10, attributes: {} },
          { type: '-test-paragraph', start: 10, end: 18, attributes: {} },
          { type: '-atjson-parse-token', start: 18, end: 20, attributes: {} },
          { type: '-test-paragraph', start: 20, end: 22, attributes: {} },
          { type: '-atjson-parse-token', start: 20, end: 22, attributes: {} },
          { type: '-test-paragraph', start: 22, end: 30, attributes: {} },
          { type: '-atjson-parse-token', start: 30, end: 32, attributes: {} },
          { type: '-test-paragraph', start: 32, end: 41, attributes: {} },
          { type: '-test-bold', start: 21, end: 21, attributes: {} }
        ]
      });

      let expected = document(
        paragraph('One fish'),
        paragraph('Two fish'),
          paragraph(
            bold()
          ),
        paragraph('Red fish'),
        paragraph('Blue fish')
      );

      expect(new HIR(zerolength).toJSON()).toEqual(expected);
    });
  });

  test('sub-documents', () => {
    let subdocument = new TestSource({
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

    let hir = new HIR(subdocument).toJSON();
    let expected = document(
      image({
        url: 'http://www.example.com/test.jpg',
        caption: document(
          'An ',
          italic('example'),
          ' caption'
        )
      })
    );

    expect(hir).toEqual(expected);
  });
});
