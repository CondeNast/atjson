import * as CK from "./ckeditor";

export function isTextNode(
  node: CK.Node | CK.DocumentFragment
): node is CK.TextNode {
  return node.is("text");
}

export function isRootElement(
  node: CK.Node | CK.DocumentFragment
): node is CK.RootElement {
  return node.is("rootElement");
}

export function isElement(
  node: CK.Node | CK.DocumentFragment
): node is CK.Element {
  return node.is("element");
}

export function isNode(node: CK.Node | CK.DocumentFragment): node is CK.Node {
  return node.is("node");
}

export function isDocumentFragment(
  node: CK.Node | CK.DocumentFragment
): node is CK.DocumentFragment {
  return node.is("documentFragment");
}
