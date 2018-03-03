import events from './mixins/events';
import { debug } from 'util';

const TEXT_NODE_TYPE = 3;
const DOCUMENT_POSITION_PRECEDING = 2;
const DOCUMENT_POSITION_FOLLOWING = 4;

function sum(a: number, b: number) {
  return a + b;
}

interface RangeEdge {
  node: Node | null;
  offset: number;
}

function getTextNode(node: Node, trailing?: boolean): Text | null {
  while (node.nodeType !== TEXT_NODE_TYPE && node != null) {
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
    this.observer = new MutationObserver(() => {
      this.textNodes = this.getTextNodes();
    });
    this.observer.observe(this, { childList: true, characterData: true, subtree: true });
    this.textNodes = this.getTextNodes();
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.textNodes = [];
  }

  getTextNodes(node?: Node): Text[] {
    let nodes: Text[] = [];
    node = node || this;

    if (node.hasChildNodes()) {
      node.childNodes.forEach((child: Node) => {
        nodes = nodes.concat(this.getTextNodes(child));
      });
    } else if (node.nodeType === TEXT_NODE_TYPE) {
      nodes.push(node as Text);
    }

    return nodes;
  }

  nodeAndOffsetForPosition(position: number) {
    let nodes = this.textNodes;
    let start = 0;

    let node = nodes.find(function (node) {
      let end = start + (node.nodeValue || '').length;
      if (position >= start && position < end) {
        return true;
      }
      start = end;
      return false;
    });

    return {
      node,
      offset: position - start
    };
  }

  getNodeAndOffset({ node, offset }: RangeEdge): { node: Text | null, offset: number } | never {
    if (node == null) {
      return { node: null, offset };
    } else if (node.nodeType === TEXT_NODE_TYPE) {
      return { node: node as Text, offset };
    } else if (node.childNodes.length > 0) {
      let textNode;
      // Firefox can return an offset that is the length
      // of the node list, which signifies that the node
      // and offset is the last node at the last character :/
      if (offset === node.childNodes.length) {
        textNode = getTextNode(node, true);
        return { node: textNode, offset: (textNode ? textNode.length : 0) };
      }
      let offsetNode = node.childNodes[offset];

      // If the offset node has a single child node,
      // use that node instead of the parent
      if (offsetNode.nodeType !== TEXT_NODE_TYPE &&
          offsetNode.childNodes.length === 1) {
        offsetNode = offsetNode.childNodes[0];
      }

      // The offset node is a text node; quickly return
      if (offsetNode.nodeType === TEXT_NODE_TYPE) {
        return { node: offsetNode as Text, offset: 0 };

      // If the selected node is wholly outside of the
      // component, it's a nil selection
      } else if (!this.contains(offsetNode)) {
        return { node: null, offset: 0 };

      // Find the closest text node and return that
      } else if (!offsetNode.hasChildNodes()) {
        let adjustedOffset = offset - 1;

        // Look for the nearest preceding text node
        do { 
          textNode = getTextNode(node.childNodes[adjustedOffset--], true);
        } while (textNode && this.contains(textNode) && adjustedOffset > 0);

        // Look for the next text node following the offset
        if (textNode) {
          offset = textNode.length;
        } else {
          adjustedOffset = offset;
          offset = 0;

          do {
            textNode = getTextNode(node.childNodes[adjustedOffset++]);
          } while (textNode && this.contains(textNode) && adjustedOffset < node.childNodes.length);
        }

        if (textNode) {
          return { node: textNode, offset };

        } else {
          throw new Error("A node / offset pair couldn't be found for the selection.");
        }
      } else {
        throw new Error("The selection for this node is ambiguous- we received a node with child nodes, but expected to get a leaf node");
      }
    } else {
      return { node: null, offset };
    }
  }

  clampRangePoint(edge: { node: Text, offset: number }): { node: Text, offset: number } {
    let firstNode = this.textNodes[0];
    let lastNode = this.textNodes[this.textNodes.length - 1];

    if (firstNode.compareDocumentPosition(edge.node) == DOCUMENT_POSITION_PRECEDING) {
      return {
        node: firstNode,
        offset: 0
      };
    } else if (lastNode.compareDocumentPosition(edge.node) == DOCUMENT_POSITION_FOLLOWING) {
      return {
        node: lastNode,
        offset: lastNode.length
      };
    }
    return edge;
  }

  clearSelection() {
    this.removeAttribute('start');
    this.removeAttribute('end');
    this.dispatchEvent(new CustomEvent('clear'));
  }

  selectedTextDidChange() {
    let range = document.getSelection();
    let nodes = this.textNodes;

    let startOfSelection = { node: range.baseNode, offset: range.baseOffset };
    let endOfSelection = { node: range.extentNode, offset: range.extentOffset };
    if (range.anchorNode) {
      startOfSelection = { node: range.anchorNode, offset: range.anchorOffset };
      endOfSelection = { node: range.focusNode, offset: range.focusOffset };
    }

    let [base, extent] = [
      this.getNodeAndOffset(startOfSelection),
      this.getNodeAndOffset(endOfSelection)
    ].sort((a, b) => {
      if (!a.node || !b.node) return 0;

      // Sort by node position then offset
      switch (a.node.compareDocumentPosition(b.node)) {
      case DOCUMENT_POSITION_PRECEDING:
        return 1;
      case DOCUMENT_POSITION_FOLLOWING:
        return -1;
      default:
        return a.offset - b.offset;
      }
    });

    let isNonZeroRange = base.node !== extent.node || base.offset !== extent.offset;

    // The selection range returned a selection with no base or extent;
    // This means that a node was selected that is not selectable
    if (base.node == null || extent.node == null) {
      this.clearSelection();
      return true;
    }

    let domRange = document.createRange();
    domRange.setStart(base.node, base.offset);
    domRange.setEnd(extent.node, extent.offset);

    let commonAncestor = domRange.commonAncestorContainer;

    if (!this.contains(commonAncestor) && !commonAncestor.contains(this)) {
      this.clearSelection();
      return true;
    }

    // Fix the base and offset nodes
    if (!this.contains(commonAncestor) && this !== commonAncestor) {
      base = this.clampRangePoint(base);
      extent = this.clampRangePoint(extent);
    }

    let lengths = nodes.map((node) => (node.nodeValue || '').length);
    let start = lengths.slice(0, nodes.indexOf(base.node)).reduce(sum, base.offset);
    let end = lengths.slice(0, nodes.indexOf(extent.node)).reduce(sum, extent.offset);

    if (start === end && isNonZeroRange) {
      return true;
    }

    this.setAttribute('start', start.toString());
    this.setAttribute('end', end.toString());
    this.dispatchEvent(new CustomEvent('change', { detail: { start, end, collapsed: start === end } }));
    return true;
  }
}

customElements.define('text-selection', TextSelection);

export default TextSelection;
