import { AdjacentBoundaryBehaviour } from '../src';
import TestSource, { Bold, Italic } from './test-source';

describe('Document.insertText', () => {
  test('insert text adds text to the content attribute', () => {
    let atjson = new TestSource({
      content: 'Hello',
      annotations: []
    });
    atjson.insertText(5, ' world.');
    expect(atjson.content).toBe('Hello world.');
  });

  test('insert text before an annotation moves it forward', () => {
    let atjson = new TestSource({
      content: 'abcd',
      annotations: [{
        type: '-test-bold',
        start: 1,
        end: 3,
        attributes: {}
      }]
    });

    atjson.insertText(0, 'zzz');
    expect(atjson.content).toBe('zzzabcd');

    let [bold] = atjson.annotations;
    expect(bold).toBeInstanceOf(Bold);
    expect(bold.toJSON()).toEqual({
      type: '-test-bold',
      start: 4,
      end: 6,
      attributes: {}
    });
  });

  test('insert text after an annotation doesn\'t affect it', () => {
    let atjson = new TestSource({
      content: 'abcd',
      annotations: [{
        type: '-test-italic',
        start: 0,
        end: 2,
        attributes: {}
      }]
    });
    atjson.insertText(3, 'zzz');
    expect(atjson.content).toBe('abczzzd');

    let [italic] = atjson.annotations;
    expect(italic).toBeInstanceOf(Italic);
    expect(italic.toJSON()).toEqual({
      type: '-test-italic',
      start: 0,
      end: 2,
      attributes: {}
    });
  });

  test('insert text inside an annotation adjusts the endpoint', () => {
    let atjson = new TestSource({
      content: 'abcd',
      annotations: [{
        type: '-test-bold',
        start: 1,
        end: 3,
        attributes: {}
      }]
    });
    atjson.insertText(2, 'xyz');
    expect(atjson.content).toBe('abxyzcd');

    let [bold] = atjson.annotations;
    expect(bold).toBeInstanceOf(Bold);
    expect(bold.toJSON()).toEqual({
      type: '-test-bold',
      start: 1,
      end: 6,
      attributes: {}
    });
  });

  test('insert text at the left boundary of an annotation', () => {
    let atjson = new TestSource({
      content: 'abcd',
      annotations: [{
        type: '-test-italic',
        start: 0,
        end: 2,
        attributes: {}
      }]
    });
    atjson.insertText(0, 'zzz');
    expect(atjson.content).toBe('zzzabcd');
    expect(atjson.annotations.map(a => a.toJSON())).toEqual([{
      type: '-test-italic',
      start: 3,
      end: 5,
      attributes: {}
    }]);
  });

  test('insert text at the right boundary of an annotation', () => {
    let atjson = new TestSource({
      content: 'abcd',
      annotations: [{
        type: '-test-italic',
        start: 0,
        end: 2,
        attributes: {}
      }]
    });
    atjson.insertText(2, 'zzz');
    expect(atjson.content).toBe('abzzzcd');
    expect(atjson.annotations.map(a => a.toJSON())).toEqual([{
      type: '-test-italic',
      start: 0,
      end: 5,
      attributes: {}
    }]);
  });

  test('insert text at the boundary of two adjacent annotations ...', () => {
    let atjson = new TestSource({
      content: 'ac',
      annotations: [{
        type: '-test-italic',
        start: 0,
        end: 1,
        attributes: {}
      }, {
        type: '-test-bold',
        start: 1,
        end: 2,
        attributes: {}
      }]
    });

    atjson.insertText(1, 'b');

    expect(atjson.content).toBe('abc');
    expect(atjson.annotations.map(a => a.toJSON())).toEqual([{
      type: '-test-italic',
      start: 0,
      end: 2,
      attributes: {}
    }, {
      type: '-test-bold',
      start: 2,
      end: 3,
      attributes: {}
    }]);
  });

  test('insert text at the left boundary of an annotation preserving boundaries', () => {
    let atjson = new TestSource({
      content: 'abcd',
      annotations: [{
        type: '-test-bold',
        start: 0,
        end: 2,
        attributes: {}
      }]
    });
    atjson.insertText(0, 'zzz', AdjacentBoundaryBehaviour.preserve);
    expect(atjson.content).toBe('zzzabcd');
    expect(atjson.annotations.map(a => a.toJSON())).toEqual([{
      type: '-test-bold',
      start: 0,
      end: 5,
      attributes: {}
    }]);
  });

  test('insert text at the right boundary of an annotation preserving boundaries', () => {
    let atjson = new TestSource({
      content: 'abcd',
      annotations: [{
        type: '-test-italic',
        start: 0,
        end: 2,
        attributes: {}
      }]
    });

    atjson.insertText(2, 'zzz', AdjacentBoundaryBehaviour.preserve);
    expect(atjson.content).toBe('abzzzcd');
    expect(atjson.annotations.map(a => a.toJSON())).toEqual([{
      type: '-test-italic',
      start: 0,
      end: 2,
      attributes: {}
    }]);
  });

  test('insert text at the boundary of two adjacent annotations preserving boundaries', () => {
    let atjson = new TestSource({
      content: 'ac',
      annotations: [{
        type: '-test-bold',
        start: 0,
        end: 1,
        attributes: {}
      }, {
        type: '-test-italic',
        start: 1,
        end: 2,
        attributes: {}
      }]
    });

    atjson.insertText(1, 'b', AdjacentBoundaryBehaviour.preserve);

    expect(atjson.content).toBe('abc');
    expect(atjson.annotations.map(a => a.toJSON())).toEqual([{
      type: '-test-bold',
      start: 0,
      end: 1,
      attributes: {}
    }, {
      type: '-test-italic',
      start: 1,
      end: 3,
      attributes: {}
    }]);
  });

  test('insert text at the boundary with a custom transform', () => {
    let atjson = new TestSource({
      content: 'abcd',
      annotations: [{
        type: '-test-manual',
        start: 0,
        end: 2,
        attributes: {}
      }]
    });

    atjson.insertText(2, 'zzz');
    expect(atjson.content).toBe('abzzzcd');
    expect(atjson.annotations[0].start).toBe(1);
    expect(atjson.annotations[0].end).toBe(3);
  });
});
