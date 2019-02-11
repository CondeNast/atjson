import { HIR } from '../src/index';
import TestSource from './test-source';
import { bold, document, image, italic, li, ol, paragraph } from './utils';

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
    expect(new HIR(validDoc).toJSON()).toMatchObject(expected);
  });

  describe('constructs a valid hierarchy', () => {

    test('from a document without nesting', () => {
      let noNesting = new TestSource({
        content: 'A string with a bold and an italic annotation',
        annotations: [
          { id: '1', type: '-test-Bold', start: 16, end: 20, attributes: {} },
          { id: '2', type: '-test-Italic', start: 28, end: 34, attributes: {} }
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

      expect(hir).toMatchObject(expected);
    });

    test('from a document with nesting', () => {
      let nested = new TestSource({
        content: 'I have a list:\n\nFirst item plus bold text\n\n' +
                 'Second item plus italic text\n\nItem 2a\n\nItem 2b\n\nAfter all the lists',
        annotations: [
          { id: '1', type: '-test-Bold', start: 32, end: 36, attributes: {} },
          { id: '2', type: '-test-Italic', start: 60, end: 66, attributes: {} },
          { id: '3', type: '-test-OrderedList', start: 16, end: 91, attributes: {} },
          { id: '4', type: '-test-ListItem', start: 16, end: 43, attributes: {} },
          { id: '5', type: '-test-ListItem', start: 43, end: 91, attributes: {} },
          { id: '6', type: '-test-OrderedList', start: 73, end: 91, attributes: {} },
          { id: '7', type: '-test-ListItem', start: 73, end: 82, attributes: {} },
          { id: '8', type: '-test-ListItem', start: 82, end: 91, attributes: {} }
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

      expect(new HIR(nested).toJSON()).toMatchObject(expected);
    });

    test('from a document with overlapping annotations at the same level', () => {
      let overlapping = new TestSource({
        content: 'Some text that is both bold and italic plus something after.',
        annotations: [
          { id: '1', type: '-test-Bold', start: 23, end: 31, attributes: {} },
          { id: '2', type: '-test-Italic', start: 28, end: 38, attributes: {} }
        ]
      });

      let expected = document(
        'Some text that is both ',
        bold('bold ', italic('and')),
        italic(' italic'),
        ' plus something after.'
      );

      expect(new HIR(overlapping).toJSON()).toMatchObject(expected);
    });

    test('from a document with overlapping annotations across heirarchical levels', () => {
      let spanning = new TestSource({
        content: 'A paragraph with some bold\n\ntext that continues into the next.',
        annotations: [
          { id: '1', type: '-test-Paragraph', start: 0, end: 28, attributes: {} },
          { id: '2', type: '-test-Paragraph', start: 28, end: 62, attributes: {} },
          { id: '3', type: '-test-Bold', start: 22, end: 32, attributes: {} }
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

      expect(new HIR(spanning).toJSON()).toMatchObject(expected);
    });

    test('from a zero-length document with annotations', () => {
      let zeroLength = new TestSource({
        content: '',
        annotations: [
          { id: '1', type: '-test-Paragraph', start: 0, end: 0, attributes: {} },
          { id: '2', type: '-test-Bold', start: 0, end: 0, attributes: {} }
        ]
      });

      let expected = document(paragraph(bold()));
      // if the test is changed to expect this, the test will pass.
      // let expected = document(paragraph(), bold());

      expect(new HIR(zeroLength).toJSON()).toMatchObject(expected);
    });

    // n.b. this is deferred until annotations have rank assigned to them,
    // since correct nesting is dependent on that. There may be a different
    // solution (e.g., handle the zero-length issue in hir-node rather than
    // at HIR init, but for now just flagging that this is an issue and this
    // test as constructed fails.
    test.skip('from a zero-length document with annotations, but backwards from the previous one', () => {
      let zeroLength = new TestSource({
        content: '',
        annotations: [
          { id: '1', type: '-test-Bold', start: 0, end: 0, attributes: {} },
          { id: '2', type: '-test-Paragraph', start: 0, end: 0, attributes: {} }
        ]
      });

      let expected = document(paragraph(bold()));

      expect(new HIR(zeroLength).toJSON()).toMatchObject(expected);
    });

    test('from a document with zero-length paragraphs', () => {
      let zeroLength = new TestSource({
        content: 'One fish\n\nTwo fish\n\n\n\nRed fish\n\nBlue fish',
        annotations: [
          { id: '1', type: '-test-Paragraph', start: 0, end: 8, attributes: {} },
          { id: '2', type: '-atjson-ParseToken', start: 8, end: 10, attributes: {} },
          { id: '3', type: '-test-Paragraph', start: 10, end: 18, attributes: {} },
          { id: '4', type: '-atjson-ParseToken', start: 18, end: 20, attributes: {} },
          { id: '5', type: '-test-Paragraph', start: 20, end: 22, attributes: {} },
          { id: '6', type: '-atjson-ParseToken', start: 20, end: 22, attributes: {} },
          { id: '7', type: '-test-Paragraph', start: 22, end: 30, attributes: {} },
          { id: '8', type: '-atjson-ParseToken', start: 30, end: 32, attributes: {} },
          { id: '9', type: '-test-Paragraph', start: 32, end: 41, attributes: {} }
        ]
      });

      let expected = document(
        paragraph('One fish'),
        paragraph('Two fish'),
        paragraph(),
        paragraph('Red fish'),
        paragraph('Blue fish')
      );

      expect(new HIR(zeroLength).toJSON()).toMatchObject(expected);
    });

    test('from a document with a point annotation', () => {
      let zeroLength = new TestSource({
        content: 'One fish\n\nTwo fish\n\n\n\nRed fish\n\nBlue fish',
        annotations: [
          { id: '1', type: '-test-Paragraph', start: 0, end: 8, attributes: {} },
          { id: '2', type: '-atjson-ParseToken', start: 8, end: 10, attributes: {} },
          { id: '3', type: '-test-Paragraph', start: 10, end: 18, attributes: {} },
          { id: '4', type: '-atjson-ParseToken', start: 18, end: 20, attributes: {} },
          { id: '5', type: '-test-Paragraph', start: 20, end: 22, attributes: {} },
          { id: '6', type: '-atjson-ParseToken', start: 20, end: 22, attributes: {} },
          { id: '7', type: '-test-Paragraph', start: 22, end: 30, attributes: {} },
          { id: '8', type: '-atjson-ParseToken', start: 30, end: 32, attributes: {} },
          { id: '9', type: '-test-Paragraph', start: 32, end: 41, attributes: {} },
          { id: '10', type: '-test-Bold', start: 21, end: 21, attributes: {} }
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

      expect(new HIR(zeroLength).toJSON()).toMatchObject(expected);
    });
  });

  test('sub-documents', () => {
    let subdocument = new TestSource({
      content: '\uFFFC',
      annotations: [{
        id: '1',
        type: '-test-Image',
        start: 0,
        end: 1,
        attributes: {
          '-test-url': 'http://www.example.com/test.jpg',
          '-test-caption': {
            content: 'An example caption',
            annotations: [{
              id: '2',
              type: '-test-Italic',
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

    expect(hir).toMatchObject(expected);
  });
});
