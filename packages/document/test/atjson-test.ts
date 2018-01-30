import AtJSON from '@atjson/document';

describe('new AtJSON', () => {
  it('constructor accepts a string', () => {
    expect(new AtJSON('Hello World.')).toBeDefined();
  });

  it('constructor accepts an object', () => {
    expect(new AtJSON({content: 'Hello World.'})).toBeDefined();
  });

  it('constructor will set annotations', () => {
    expect(new AtJSON({
      content: 'Hello World.',
      annotations: [ { type: 'test', start: 0, end: 2 } ]
    })).toBeDefined();
  });
});
