import Document from '@atjson/document';

describe('Document.insertText', () => {
  it('insert text adds text to the content attribute', () => {
    let atjson = new Document('Hello');
    atjson.insertText(5, ' world.');
    expect(atjson.content).toBe('Hello world.');
  });

  it('insert text before an annotation moves it forward', () => {
    let atjson = new Document({content: 'abcd', annotations: [{type: 'bc', start: 1, end: 3}]});
    atjson.insertText(0, 'zzz');
    expect(atjson.content).toBe('zzzabcd');
    expect(atjson.annotations[0]).toEqual({type: 'bc', start: 4, end: 6});
  });

  it('insert text after an annotation doesn\'t affect it', () => {
    let atjson = new Document({content: 'abcd', annotations: [{type: 'ab', start: 0, end: 2}]});
    atjson.insertText(3, 'zzz');
    expect(atjson.content).toBe('abczzzd');
    expect(atjson.annotations[0]).toEqual({type: 'ab', start: 0, end: 2});
  });

  it('insert text inside an annotation adjusts the endpoint', () => {
    let atjson = new Document({
      content: 'abcd',
      annotations: [ { type: 'bc', start: 1, end: 3 } ]
    });
    atjson.insertText(2, 'xyz');
    expect(atjson.content).toBe('abxyzcd');
    expect({type: 'bc', start: 1, end: 6}).toEqual(atjson.annotations[0]);
  });

  it('insert text at the left boundary of an annotation', () => {
    let atjson = new Document({content: 'abcd', annotations: [{type: 'ab', start: 0, end: 2}]});
    atjson.insertText(0, 'zzz');
    expect(atjson.content).toBe('zzzabcd');
    expect(atjson.annotations[0]).toEqual({type: 'ab', start: 3, end: 5});
  });

  it('insert text at the right boundary of an annotation', () => {
    let atjson = new Document({content: 'abcd', annotations: [{type: 'ab', start: 0, end: 2}]});
    atjson.insertText(2, 'zzz');
    expect(atjson.content).toBe('abzzzcd');
    expect(atjson.annotations[0]).toEqual({type: 'ab', start: 0, end: 5});
  });

  it('insert text at the boundary of two adjacent annotations ...', () => {
    let atjson = new Document({
      content: 'ac',
      annotations: [
        {type: 'a', start: 0, end: 1},
        {type: 'c', start: 1, end: 2}
      ]
    });

    atjson.insertText(1, 'b');

    expect(atjson.content).toBe('abc');
    expect(atjson.annotations).toEqual([
      { type: 'a', start: 0, end: 2 },
      { type: 'c', start: 2, end: 3 }
    ]);
  });

  it('insert text at the left boundary of an annotation preserving boundaries', () => {
    let atjson = new Document({content: 'abcd', annotations: [{type: 'ab', start: 0, end: 2}]});
    atjson.insertText(0, 'zzz', true);
    expect(atjson.content).toBe('zzzabcd');
    expect(atjson.annotations[0]).toEqual({type: 'ab', start: 0, end: 5});
  });

  it('insert text at the right boundary of an annotation preserving boundaries', () => {
    let atjson = new Document({content: 'abcd', annotations: [{type: 'ab', start: 0, end: 2}]});
    atjson.insertText(2, 'zzz', true);
    expect(atjson.content).toBe('abzzzcd');
    expect(atjson.annotations[0]).toEqual({type: 'ab', start: 0, end: 2});
  });

  it('insert text at the boundary of two adjacent annotations preserving boundaries', () => {
    let atjson = new Document({
      content: 'ac',
      annotations: [
        {type: 'a', start: 0, end: 1},
        {type: 'c', start: 1, end: 2}
      ]
    });

    atjson.insertText(1, 'b', true);

    expect(atjson.content).toBe('abc');
    expect(atjson.annotations).toEqual([
      { type: 'a', start: 0, end: 1 },
      { type: 'c', start: 1, end: 3 }
    ]);
  });

  it('insert text at the boundary with a custom transform', () => {
    let atjson = new Document({content: 'abcd', annotations: [
      { type: 'ab', start: 0, end: 2,
        transform: (annotation, content, position, length, preserveAdjacentBoundaries): void => {
          expect(annotation.start).toBe(0);
          expect(annotation.end).toBe(2);
          expect(content).toBe('abzzzcd');
          expect(position).toBe(2);
          expect(length).toBe(3);
          expect(preserveAdjacentBoundaries).toBe(false);

          // artificial adjustment
          annotation.start = 1;
          annotation.end = 3;
        }
      }
    ]});

    atjson.insertText(2, 'zzz');
    expect(atjson.content).toBe('abzzzcd');
    expect(atjson.annotations[0].start).toBe(1);
    expect(atjson.annotations[0].end).toBe(3);
  });
});
