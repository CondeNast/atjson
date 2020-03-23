import { InlineAnnotation } from "@atjson/document";
import { HIRNode, RootAnnotation } from "../src";
import {
  Blockquote,
  Bold,
  Image,
  ListItem,
  OrderedList,
  Paragraph,
} from "./test-source";
import {
  blockquote,
  bold,
  document,
  image,
  li,
  node,
  ol,
  paragraph,
} from "./utils";

class TestAnnotation extends InlineAnnotation {
  static vendorPrefix = "test";
  static type = "test";
}

class A extends InlineAnnotation {
  static vendorPrefix = "test";
  static type = "a";
}

class B extends InlineAnnotation {
  static vendorPrefix = "test";
  static type = "b";
}

class C extends InlineAnnotation {
  static vendorPrefix = "test";
  static type = "c";
}

let test = node("test");
let a = node("a");
let b = node("b");
let c = node("c");

describe("@atjson/hir/hir-node", () => {
  it("insert sibling simple case works", () => {
    let hir = new HIRNode(
      new RootAnnotation({ id: "0", start: 0, end: 10, attributes: {} })
    );
    hir.insertAnnotation(
      new TestAnnotation({ id: "1", start: 0, end: 5, attributes: {} })
    );
    hir.insertAnnotation(
      new TestAnnotation({ id: "2", start: 5, end: 10, attributes: {} })
    );

    expect(hir.toJSON()).toMatchObject(document(test(), test()));
  });

  it("insert child simple case works", () => {
    let hir = new HIRNode(
      new RootAnnotation({ id: "0", start: 0, end: 10, attributes: {} })
    );
    hir.insertAnnotation(
      new TestAnnotation({ id: "1", start: 0, end: 5, attributes: {} })
    );

    expect(hir.toJSON()).toMatchObject(document(test()));
  });

  it("insert text simple case works", () => {
    let hir = new HIRNode(
      new RootAnnotation({ id: "0", start: 0, end: 10, attributes: {} })
    );
    hir.insertAnnotation(
      new TestAnnotation({ id: "1", start: 0, end: 5, attributes: {} })
    );
    hir.insertAnnotation(
      new TestAnnotation({ id: "2", start: 5, end: 10, attributes: {} })
    );

    hir.insertText("some text.");

    expect(hir.toJSON()).toMatchObject(document(test("some "), test("text.")));
  });

  it("insert text nested children case works", () => {
    let hir = new HIRNode(
      new RootAnnotation({ id: "0", start: 0, end: 10, attributes: {} })
    );
    hir.insertAnnotation(new A({ id: "1", start: 0, end: 5, attributes: {} }));
    hir.insertAnnotation(new B({ id: "3", start: 2, end: 4, attributes: {} }));
    hir.insertAnnotation(new C({ id: "4", start: 5, end: 10, attributes: {} }));

    hir.insertText("some text.");

    expect(hir.toJSON()).toMatchObject(
      document(a("so", b("me"), " "), c("text."))
    );
  });

  it("out-of-order insertion of different rank nodes works", () => {
    let hir = new HIRNode(
      new RootAnnotation({ id: "0", start: 0, end: 10, attributes: {} })
    );
    hir.insertAnnotation(
      new Paragraph({ id: "1", start: 4, end: 8, attributes: {} })
    );
    hir.insertAnnotation(
      new OrderedList({ id: "2", start: 4, end: 8, attributes: {} })
    );
    hir.insertAnnotation(
      new Paragraph({ id: "3", start: 8, end: 10, attributes: {} })
    );
    hir.insertAnnotation(
      new ListItem({ id: "4", start: 4, end: 8, attributes: {} })
    );
    hir.insertAnnotation(
      new Paragraph({ id: "5", start: 0, end: 4, attributes: {} })
    );

    hir.insertText("ab\n\nli\n\ncd");

    expect(hir.toJSON()).toMatchObject(
      document(
        paragraph("ab\n\n"),
        ol(li(paragraph("li\n\n"))),
        paragraph("cd")
      )
    );
  });

  it("insert paragraph after bold works", () => {
    let hir = new HIRNode(
      new RootAnnotation({ id: "0", start: 0, end: 10, attributes: {} })
    );
    hir.insertAnnotation(
      new Bold({ id: "1", start: 4, end: 6, attributes: {} })
    );
    hir.insertAnnotation(
      new Paragraph({ id: "2", start: 0, end: 10, attributes: {} })
    );

    hir.insertText("abcdefghij");

    expect(hir.toJSON()).toMatchObject(
      document(paragraph("abcd", bold("ef"), "ghij"))
    );
  });

  it("annotations can override display properties", () => {
    let hir = new HIRNode(
      new RootAnnotation({ id: "0", start: 0, end: 10, attributes: {} })
    );
    hir.insertAnnotation(
      new Bold({ id: "1", start: 0, end: 1, attributes: {} })
    );
    hir.insertAnnotation(
      new Image({ id: "2", start: 0, end: 1, attributes: {} })
    );
    hir.insertAnnotation(
      new Blockquote({ id: "3", start: 0, end: 1, attributes: {} })
    );

    expect(hir.toJSON()).toMatchObject(document(blockquote(bold(image()))));
  });

  it("correctly inserts zero-length elements at boundaries", () => {
    let hir = new HIRNode(
      new RootAnnotation({ id: "0", start: 0, end: 3, attributes: {} })
    );
    hir.insertAnnotation(
      new Paragraph({ id: "1", start: 0, end: 3, attributes: {} })
    );
    hir.insertAnnotation(
      new Image({ id: "2", start: 3, end: 3, attributes: {} })
    );

    hir.insertText("abc");

    expect(hir.toJSON()).toMatchObject(document(paragraph("abc", image())));
  });
});
