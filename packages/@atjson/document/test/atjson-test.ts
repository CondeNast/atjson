import Document from '@atjson/document';

describe('new Document', () => {
  it('constructor accepts a string', () => {
    expect(new Document('Hello World.')).toBeDefined();
  });

  it('constructor accepts an object', () => {
    expect(new Document({content: 'Hello World.'})).toBeDefined();
  });

  it('constructor will set annotations', () => {
    expect(new Document({
      content: 'Hello World.',
      annotations: [ { type: 'test', start: 0, end: 2 } ]
    })).toBeDefined();
  });

  describe('slice', () => {
    let document = new Document({
      content: 'Hello, world!',
      contentType: 'text/atjson',
      annotations: [{
        type: 'bold',
        start: 0,
        end: 5
      }, {
        type: 'italic',
        start: 0,
        end: 13
      }]
    });

    it('will return a sub-document with only', () => {
      let doc = document.slice(1, 13);
      expect(doc.content).toBe('ello, world!');
      expect(doc.annotations).toEqual([{
        type: 'bold',
        start: 0,
        end: 4
      }, {
        type: 'italic',
        start: 0,
        end: 12
      }]);
      expect(doc.contentType).toEqual(document.contentType);
    });
  });
});
