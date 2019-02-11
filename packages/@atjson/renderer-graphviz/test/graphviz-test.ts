import Document, { InlineAnnotation } from '@atjson/document';
import GraphvizRenderer from '../src';
import { writeFileSync } from 'fs';
import { join } from 'path';

class Bold extends InlineAnnotation {
  static vendorPrefix = 'test';
  static type = 'Bold';
}

class Italic extends InlineAnnotation {
  static vendorPrefix = 'test';
  static type = 'Italic';
}

class Link extends InlineAnnotation {
  static vendorPrefix = 'test';
  static type = 'Link';
  attributes!: {
    url: string;
  };
}

class TestSource extends Document {
  static contentType = 'application/vnd.atjson+test';
  static schema = [Bold, Italic, Link];
}

describe('graphviz', () => {
  test('a simple document', () => {
    let doc = new TestSource({
      content: 'Hello, world',
      annotations: [{
        id: '1',
        type: '-test-Bold',
        start: 0,
        end: 5,
        attributes: {}
      }]
    });
    expect(GraphvizRenderer.render(doc)).toBe(`digraph atjson{
  node [shape=oval];
  Root1 [label="Root\\n{}" style=filled fillcolor="#222222" fontcolor="#FFFFFF"];
  Bold2 [label="Bold\\n{}" style=filled fillcolor="#888888" fontcolor="#FFFFFF"];
  Text3 [label="Text\\nHello" style=filled fillcolor="#FFFFFF" fontcolor="#000000"];
  Text4 [label="Text\\n, world" style=filled fillcolor="#FFFFFF" fontcolor="#000000"];
  Bold2 -> Text3;
  Root1 -> Bold2;
  Root1 -> Text4;
}`);
  });

  test('example', () => {
    let doc = new TestSource({
      content: 'The best writing anywhere, everywhere.',
      annotations: [{
        id: '1',
        type: '-test-Italic',
        start: 4,
        end: 8,
        attributes: {}
      }, {
        id: '2',
        type: '-test-Bold',
        start: 17,
        end: 25,
        attributes: {}
      }, {
        id: '3',
        type: '-test-Link',
        start: 0,
        end: 38,
        attributes: {
          '-test-url': 'https://newyorker.com'
        }
      }]
    });

    let result = GraphvizRenderer.render(doc, { shape: 'record' });
    expect(result).toMatchSnapshot();
    writeFileSync(join(__dirname, '../example.dot'), result);
  });

  for (let shape of ['record', 'Mrecord']) {
    test(`${shape} node shapes`, () => {
      let doc = new TestSource({
        content: 'Hello, world',
        annotations: [{
          id: '1',
          type: '-test-Bold',
          start: 0,
          end: 5,
          attributes: {}
        }]
      });

      expect(GraphvizRenderer.render(doc, { shape })).toBe(`digraph atjson{
  node [shape=${shape}];
  Root1 [label="{Root|{}}" style=filled fillcolor="#222222" fontcolor="#FFFFFF"];
  Bold2 [label="{Bold|{}}" style=filled fillcolor="#888888" fontcolor="#FFFFFF"];
  Text3 [label="{Text|Hello}" style=filled fillcolor="#FFFFFF" fontcolor="#000000"];
  Text4 [label="{Text|, world}" style=filled fillcolor="#FFFFFF" fontcolor="#000000"];
  Bold2 -> Text3;
  Root1 -> Bold2;
  Root1 -> Text4;
}`);
    });
  }
});
