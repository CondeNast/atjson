export const TEXT_NODE_TYPE = 3;
export const DOCUMENT_POSITION_PRECEDING = 2;
export const DOCUMENT_POSITION_FOLLOWING = 4;

export function getTextNodes(node: Node): Text[] {
  let nodes: Text[] = [];

  if (node.hasChildNodes()) {
    node.childNodes.forEach((child: Node) => {
      nodes = nodes.concat(getTextNodes(child));
    });
  } else if (node.nodeType === TEXT_NODE_TYPE) {
    nodes.push(node as Text);
  }

  return nodes;
}

export function nextTextNode(node: Node): [Text | null, number] {
  let nextNode: Node | null = node;
  while (nextNode) {
    let textNodes = getTextNodes(nextNode);
    if (textNodes.length) {
      return [textNodes[0], 0];
    }
    nextNode = nextNode.nextSibling;
  }
  if (node.parentNode) {
    return nextTextNode(node.parentNode);
  }
  return [null, 0];
}

export function previousTextNode(node: Node): [Text | null, number] {
  let previousNode: Node | null = node;
  while (previousNode) {
    let textNodes = getTextNodes(previousNode);
    if (textNodes.length) {
      let textNode = textNodes[textNodes.length - 1];
      return [textNode, textNode.length];
    }
    previousNode = previousNode.previousSibling;
  }
  if (node.parentNode) {
    return previousTextNode(node.parentNode);
  }
  return [null, 0];
}

export function clampRangePoint(textNodes: Text[], [text, offset]: [Text | null, number]): [Text | null, number] {
  if (text == null) {
    return [text, offset];
  }
  let firstNode = textNodes[0];
  let lastNode = textNodes[textNodes.length - 1];

  if (firstNode.compareDocumentPosition(text) === DOCUMENT_POSITION_PRECEDING) {
    return [firstNode, 0];

  } else if (lastNode.compareDocumentPosition(text) === DOCUMENT_POSITION_FOLLOWING) {
    return [lastNode, lastNode.length];

  }
  return [text, offset];
}

export function getNodeAndOffset(element: Node, [node, offset]: [Node | null, number], leading: boolean): [Text | null, number] | never | null {
  // No node to get an offset for; bail
  if (node == null) {
    return [null, offset];

  // The offset is a text offset
  } else if (node.nodeType === TEXT_NODE_TYPE) {
    return [node as Text, offset];

  // If the node is outside the
  } else if (!element.contains(node) && element !== node) {
    switch (element.compareDocumentPosition(node)) {
      case DOCUMENT_POSITION_PRECEDING:
        return previousTextNode(node);
      case DOCUMENT_POSITION_FOLLOWING:
        return nextTextNode(node);
      default:
        return [null, 0];
      }

  // If the node isn't a text node, the offset refers to a
  // node offset. We will disambiguate this to a text offset
  } else if (node.childNodes.length > offset) {
    let offsetNode = node.childNodes[offset];
    let textNodes = getTextNodes(offsetNode);

    // If the offset node has a single child node,
    // use that node instead of the parent
    if (textNodes.length === 1) {
      return [textNodes[0], 0];
    }

    // Find the closest text node and return that
    if (textNodes.length === 0) {
      if (leading) {
        return previousTextNode(node);
      }
      return nextTextNode(node);
    }

    // throw new Error("The selection for this node is ambiguous- we received a node with child nodes, but expected to get a leaf node");
    return null;

  // Firefox can return an offset that is the length
  // of the node list, which signifies that the node
  // and offset is the last node at the last character :/
  } else if (node.childNodes.length === offset) {
    let textNodes = getTextNodes(node);
    let textNode = textNodes[textNodes.length - 1];
    return [textNode, textNode ? textNode.length : 0];

  } else {
    return [null, offset];
  }
}

export function getOffset(element: Node, nodes: Text[], selection: Selection): { start: number, end: number} | null | void {
  let nodeRange: [[Node | null, number], [Node | null, number]] = [
    [selection.baseNode, selection.baseOffset],
    [selection.extentNode, selection.extentOffset]
  ];

  if (selection.anchorNode) {
    nodeRange = [
      [selection.anchorNode, selection.anchorOffset],
      [selection.focusNode, selection.focusOffset]
    ];
  }
  nodeRange = nodeRange.sort(([aNode, aOffset], [bNode, bOffset]) => {
    if (!aNode || !bNode) return 0;

    // Sort by node position then offset
    switch (aNode.compareDocumentPosition(bNode)) {
    case DOCUMENT_POSITION_PRECEDING:
      return 1;
    case DOCUMENT_POSITION_FOLLOWING:
      return -1;
    default:
      return aOffset - bOffset;
    }
  });

  let [start, end] = [
    getNodeAndOffset(element, nodeRange[0], true),
    getNodeAndOffset(element, nodeRange[1], false)
  ];

  // getNodeAndOffset throws in case the node doesn't exist in the
  // document. Often, this happens if we've entered a context inside of a
  // web component whose text nodes are not exposed via slots, so just do
  // nothing. We don't want to clear the selection here because that may
  // trigger unexpected problems in the state of editable components.
  if (start === null || end === null) {
    return;
  }

  let startTextNode = start[0];
  let endTextNode = end[0];

  // The selection range returned a selection with no base or extent;
  // This means that a node was selected that is not selectable
  if (startTextNode === null || endTextNode === null) {
    return null;
  }

  let isNonZeroRange = startTextNode !== endTextNode || start[1] !== end[1];

  let domRange = document.createRange();
  domRange.setStart(startTextNode, start[1]);
  domRange.setEnd(endTextNode, end[1]);
  let commonAncestor = domRange.commonAncestorContainer;

  if (!element.contains(commonAncestor) && !commonAncestor.contains(element)) {
    return null;
  }

  // Fix the base and offset nodes
  if (!element.contains(commonAncestor) && element !== commonAncestor) {
    start = clampRangePoint(nodes, start);
    end = clampRangePoint(nodes, end);
  }

  let lengths = nodes.map(node => (node.nodeValue || '').length);
  let range = {
    start: lengths.slice(0, nodes.indexOf(startTextNode)).reduce((a, b) => a + b, start[1]),
    end: lengths.slice(0, nodes.indexOf(endTextNode)).reduce((a, b) => a + b, end[1])
  };

  if (range.start === range.end && isNonZeroRange) {
    return;
  }

  return range;
}
