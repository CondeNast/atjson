import TestSource, { Bold, Paragraph } from './test-source';
import { TextSource } from './text-source-test';

describe('Document#convert', () => {
  test('sources without conversions are coerced', () => {
    let textDoc = TextSource.fromRaw('Hello, World!');
    let testDoc = textDoc.convertTo(TestSource);
    expect(testDoc).toBeInstanceOf(TestSource);
    expect(testDoc.all().toJSON()).toEqual(textDoc.all().toJSON());
  });

  test('sources with conversions are called', () => {
    let testDoc = new TestSource({
      content: 'Hello, World!',
      annotations: [
        new Paragraph({ start: 0, end: 13 }),
        new Bold({ start: 0, end: 5 })
      ]
    });
    TestSource.defineConverterTo(TextSource, doc => {
      let { schema: expectedSchema, ...expectedJson } = doc.toJSON();
      let { schema: actualSchema, ...actualJson } = testDoc.toJSON();
      expect(expectedJson).toMatchObject(actualJson);
      expect(expectedSchema).toEqual(expect.arrayContaining(actualSchema));
      doc.where(a => a.type !== 'paragraph').remove();
      doc.where({ type: '-test-paragraph' }).set({ type: '-text-paragraph' });

      return doc;
    });

    let textDoc = testDoc.convertTo(TextSource);
    expect(textDoc.all().toJSON()).toEqual([{
      id: 'Any<id>',
      type: '-text-paragraph',
      start: 0,
      end: 13,
      attributes: {}
    }]);
  });

  test('converting to the same type is a no-op', () => {
    let testDoc = new TestSource({
      content: 'Hello, World!',
      annotations: [
        new Paragraph({ start: 0, end: 13 }),
        new Bold({ start: 0, end: 5 })
      ]
    });

    expect(testDoc.convertTo(TestSource).toJSON()).toEqual(testDoc.toJSON());
  });
});
