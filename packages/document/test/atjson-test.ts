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
});
