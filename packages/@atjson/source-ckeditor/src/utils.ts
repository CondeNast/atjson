import * as CK from "./ckeditor";

export function isTextNode(node: CK.Node): node is CK.TextNode {
  return node.is("text");
}

export function isRootElement(node: CK.Node): node is CK.RootElement {
  return node.is("rootElement");
}

export function isElement(node: CK.Node): node is CK.Element {
  return node.is("element");
}
