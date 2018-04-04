import events from './mixins/events';

const TEXT_NODE_TYPE = 3;
const DOCUMENT_POSITION_PRECEDING = 2;
const DOCUMENT_POSITION_FOLLOWING = 4;

function sum(a: number, b: number): number {
  return a + b;
}

type MaybeNode = Node | null;
type NodeRangePoint = [MaybeNode, number];
type NodeRange = [NodeRangePoint, NodeRangePoint];
type TextRangePoint = [Text | null, number];

function getTextNode(node: MaybeNode, trailing?: boolean): Text | null {
  while (node && node.nodeType !== TEXT_NODE_TYPE && node != null) {
    if (trailing) {
      node = node.childNodes[node.childNodes.length - 1];
    } else {
      node = node.childNodes[0];
    }
  }
  if (node) {
    return node as Text;
  }
  return null;
}

function getTextNodes(node: Node): Text[] {
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

function nextTextNode(node: Node): TextRangePoint {
  let nextNode: MaybeNode = node;
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

function previousTextNode(node: Node): TextRangePoint {
  let previousNode: MaybeNode = node;
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

/**
  Events available for listening for <text-selection>:

  - `change`- called when the text selection changes
  - `clear`- called when the text selecton is cleared
 */
class TextSelection extends events(HTMLElement) {
  static observedAttributes = ['start', 'end'];
  static events = {
    'selectionchange document': 'selectedTextDidChange'
  };

  private textNodes: Text[];
  private observer?: MutationObserver | null;

  constructor() {
    super();
    this.textNodes = [];
  }

  connectedCallback() {
    super.connectedCallback();

    // Setup observers so when the underlying text changes,
    // we update the text nodes that we want to map our selection from
    this.observer = new MutationObserver(() => this.reset());
    this.observer.observe(this, { childList: true, characterData: true, subtree: true });

    this.reset();
  }

  reset() {
    this.textNodes = getTextNodes(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.textNodes = [];
  }

  private getNodeAndOffset([node, offset]: NodeRangePoint, leading: boolean): TextRangePoint | never {
    // No node to get an offset for; bail
    if (node == null) {
      return [null, offset];

    // The offset is a text offset
    } else if (node.nodeType === TEXT_NODE_TYPE) {
      return [node as Text, offset];

    // If the node is outside the 
    } else if (!this.contains(node) && this !== node) {
      switch (this.compareDocumentPosition(node)) {
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

      throw new Error("The selection for this node is ambiguous- we received a node with child nodes, but expected to get a leaf node");

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

  private clampRangePoint([text, offset]: TextRangePoint): TextRangePoint {
    if (text == null) {
      return [text, offset];
    }
    let firstNode = this.textNodes[0];
    let lastNode = this.textNodes[this.textNodes.length - 1];

    if (firstNode.compareDocumentPosition(text) == DOCUMENT_POSITION_PRECEDING) {
      return [firstNode, 0];

    } else if (lastNode.compareDocumentPosition(text) == DOCUMENT_POSITION_FOLLOWING) {
      return [lastNode, lastNode.length];

    }
    return [text, offset];
  }

  private clearSelection() {
    this.removeAttribute('start');
    this.removeAttribute('end');
    this.dispatchEvent(new CustomEvent('clear'));
  }

  private selectedTextDidChange() {
    let selectionRange = document.getSelection();
    let nodes = this.textNodes;

    let nodeRange: NodeRange = [[selectionRange.baseNode, selectionRange.baseOffset],
                            [selectionRange.extentNode, selectionRange.extentOffset]];
    if (selectionRange.anchorNode) {
      nodeRange = [[selectionRange.anchorNode, selectionRange.anchorOffset],
                   [selectionRange.focusNode, selectionRange.focusOffset]];
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
      this.getNodeAndOffset(nodeRange[0], true),
      this.getNodeAndOffset(nodeRange[1], false)
    ];

    let isNonZeroRange = start[0] !== end[0] || start[1] !== end[1];

    // The selection range returned a selection with no base or extent;
    // This means that a node was selected that is not selectable
    if (start[0] == null || end[0] == null) {
      this.clearSelection();
      return true;
    }

    let domRange = document.createRange();
    domRange.setStart(start[0], start[1]);
    domRange.setEnd(end[0], end[1]);

    let commonAncestor = domRange.commonAncestorContainer;

    if (!this.contains(commonAncestor) && !commonAncestor.contains(this)) {
      this.clearSelection();
      return true;
    }

    // Fix the base and offset nodes
    if (!this.contains(commonAncestor) && this !== commonAncestor) {
      start = this.clampRangePoint(start);
      end = this.clampRangePoint(end);
    }

    let lengths = nodes.map((node) => (node.nodeValue || '').length);
    let range = [
      lengths.slice(0, nodes.indexOf(start[0])).reduce(sum, start[1]),
      lengths.slice(0, nodes.indexOf(end[0])).reduce(sum, end[1])
    ];

    if (range[0] === range[1] && isNonZeroRange) {
      return true;
    }

    this.setAttribute('start', range[0].toString());
    this.setAttribute('end', range[1].toString());
    this.dispatchEvent(new CustomEvent('change', {
      detail: {
        start: range[0],
        end: range[1],
        collapsed: range[0] === range[1]
      }
    }));
    return true;
  }
}

customElements.define('text-selection', TextSelection);

export default TextSelection;
