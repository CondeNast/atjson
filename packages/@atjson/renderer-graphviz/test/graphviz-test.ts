import Document, { InlineAnnotation } from "@atjson/document";
import GraphvizRenderer from "../src/index";
import { writeFileSync } from "fs";
import { join } from "path";

class Bold extends InlineAnnotation {
  static vendorPrefix = "test";
  static type = "bold";
}

class Italic extends InlineAnnotation {
  static vendorPrefix = "test";
  static type = "italic";
}

class Link extends InlineAnnotation<{
  url: string;
}> {
  static vendorPrefix = "test";
  static type = "link";
}

class TestSource extends Document {
  static contentType = "application/vnd.atjson+test";
  static schema = [Bold, Italic, Link];
}

describe("graphviz", () => {
  test("a simple document", () => {
    let doc = new TestSource({
      content: "Hello, world",
      annotations: [
        {
          id: "1",
          type: "-test-bold",
          start: 0,
          end: 5,
          attributes: {}
        }
      ]
    });
    expect(GraphvizRenderer.render(doc)).toBe(`digraph atjson{
  node [shape=oval];
  root1 [label="root\\n{}" style=filled fillcolor="#222222" fontcolor="#FFFFFF"];
  bold2 [label="bold\\n{}" style=filled fillcolor="#888888" fontcolor="#FFFFFF"];
  text3 [label="text\\nHello" style=filled fillcolor="#FFFFFF" fontcolor="#000000"];
  text4 [label="text\\n, world" style=filled fillcolor="#FFFFFF" fontcolor="#000000"];
  bold2 -> text3;
  root1 -> bold2;
  root1 -> text4;
}`);
  });

  test("example", () => {
    let doc = new TestSource({
      content: "The best writing anywhere, everywhere.",
      annotations: [
        {
          id: "1",
          type: "-test-italic",
          start: 4,
          end: 8,
          attributes: {}
        },
        {
          id: "2",
          type: "-test-bold",
          start: 17,
          end: 25,
          attributes: {}
        },
        {
          id: "3",
          type: "-test-link",
          start: 0,
          end: 38,
          attributes: {
            "-test-url": "https://newyorker.com"
          }
        }
      ]
    });

    let result = GraphvizRenderer.render(doc, { shape: "record" });
    expect(result).toMatchSnapshot();
    writeFileSync(join(__dirname, "../example.dot"), result);
  });

  for (let shape of ["record", "Mrecord"]) {
    test(`${shape} node shapes`, () => {
      let doc = new TestSource({
        content: "Hello, world",
        annotations: [
          {
            id: "1",
            type: "-test-bold",
            start: 0,
            end: 5,
            attributes: {}
          }
        ]
      });

      expect(GraphvizRenderer.render(doc, { shape })).toBe(`digraph atjson{
  node [shape=${shape}];
  root1 [label="{root|{}}" style=filled fillcolor="#222222" fontcolor="#FFFFFF"];
  bold2 [label="{bold|{}}" style=filled fillcolor="#888888" fontcolor="#FFFFFF"];
  text3 [label="{text|Hello}" style=filled fillcolor="#FFFFFF" fontcolor="#000000"];
  text4 [label="{text|, world}" style=filled fillcolor="#FFFFFF" fontcolor="#000000"];
  bold2 -> text3;
  root1 -> bold2;
  root1 -> text4;
}`);
    });
  }
});
