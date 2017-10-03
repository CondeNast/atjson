import { AtJSON } from '../src/index';

describe('new AtJSON', function () {
  it('constructor accepts a string', function () {
    expect(new AtJSON('Hello World.')).toBeDefined();
  });

  it('constructor accepts an object', function () {
    expect(new AtJSON({content: 'Hello World.'})).toBeDefined();
  });

  it('constructor will set annotations', function () {
    expect(new AtJSON({
      content: 'Hello World.',
      annotations: [ { type: 'test', start: 0, end: 2 } ]
    })).toBeDefined();
  });
});

