import Document from '@atjson/document';
import GraphvizRenderer from '../src/index';

describe('graphviz', () => {
  test('a simple document', () => {
    let doc = new Document({
      content: 'Hello, world',
      annotations: [{
        type: 'bold',
        start: 0,
        end: 5
      }]
    });
    let renderer = new GraphvizRenderer();
    expect(renderer.render(doc)).toBe(`digraph atjson{
  node [shape=oval];
  root1 [label="root\\n{}"];
  bold2 [label="bold\\n{}"];
  text3 [label="text\\nHello"];
  text4 [label="text\\n, world"];
  bold2 -> text3;
  root1 -> bold2;
  root1 -> text4;
}`);
  });

  for (let shape of ['record', 'Mrecord']) {
    test(`${shape} node shapes`, () => {
      let doc = new Document({
        content: 'Hello, world',
        annotations: [{
          type: 'bold',
          start: 0,
          end: 5
        }]
      });

      let renderer = new GraphvizRenderer();
      expect(renderer.render(doc, { shape })).toBe(`digraph atjson{
  node [shape=${shape}];
  root1 [label="{root|{}}"];
  bold2 [label="{bold|{}}"];
  text3 [label="{text|Hello}"];
  text4 [label="{text|, world}"];
  bold2 -> text3;
  root1 -> bold2;
  root1 -> text4;
}`);
    });
  }
});
