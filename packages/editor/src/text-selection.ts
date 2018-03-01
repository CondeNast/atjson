import events from './mixins/events';

const TEXT_NODE_TYPE = 3;
const DOCUMENT_POSITION_PRECEDING = 2;
const DOCUMENT_POSITION_FOLLOWING = 4;

function sum(a, b) {
  return a + b;
}

/**
  Events available for listening for <text-selection>:

  - `change`- called when the text selection changes
  - `clear`- called when the text selecton is cleared
 */
class TextSelection extends events(HTMLElement) {
  static observedAttributes = ['start', 'end'];
  static events = {
    'selectionchange document': 'selectedTextDidChange',
    'mousedown': 'willSelectText',
    'mouseup': 'didSelectText'
  };

  private textNodes: Text[] | null;

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

    this.observer.disconnect();
    this.observer = null;
    this.textNodes = null;
  }

  getTextNodes(element?: Element): Text[] {
    let nodes = [];
    element = element || this;

    if (element.hasChildNodes()) {
      element.childNodes.forEach((node) => {
        nodes = nodes.concat(this.getTextNodes(node));
      });
    } else if (element.nodeType === TEXT_NODE_TYPE) {
      nodes.push(element);
    }

    return nodes;
  }

  nodeAndOffsetForPosition(position: number) {
    let nodes = this.textNodes;
    let start = 0;

    let node = nodes.find(function (node) {
      let end = start + node.nodeValue.length;
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

  willSelectText() {
    this.isSelecting = true;
  }

  didSelectText() {
    this.isSelecting = false;
  }

  getNodeAndOffset(node: Element | null, offset: number): { node: Element | null, offset: number } | never {
    if (node == null) {
      return { node: null, offset };
    } else if (node.nodeType === TEXT_NODE_TYPE) {
      return { node, offset };
    } else if (node.childNodes.length > 0) {
      let offsetNode = node.childNodes[offset];

      // If the offset node has a single child node,
      // use that node instead of the parent
      if (offsetNode.nodeType !== TEXT_NODE_TYPE &&
          offsetNode.childNodes.length === 1) {
        offsetNode = offsetNode.childNodes[0];
      }

      // The offset node is a text node; quickly return
      if (offsetNode.nodeType === TEXT_NODE_TYPE) {
        return { node: offsetNode, offset: 0 };

      // Find the closest text node and return that
      } else if (!offsetNode.hasChildNodes()) {
        let adjustedOffset = offset - 1;

        // Look for the nearest preceding text node
        while (offsetNode.nodeType !== TEXT_NODE_TYPE &&
               adjustedOffset > 0) {
          offsetNode = node.childNodes[adjustedOffset--];
        }

        if (offsetNode.nodeType === TEXT_NODE_TYPE) {
          offset = offsetNode.length;

        // Look for the next text node following the offset
        } else {
          adjustedOffset = offset;
          offset = 0;
          while (offsetNode.nodeType !== TEXT_NODE_TYPE &&
                 adjustedOffset < node.childNodes.length) {
            offsetNode = node.childNodes[adjustedOffset++];
          }
        }

        if (offsetNode.nodeType !== TEXT_NODE_TYPE) {
          throw new Error("A node / offset pair couldn't be found for the selection.");
        } else {
          return { node: offsetNode, offset };
        }
      } else {
        throw new Error("The selection for this node is ambiguous- we received a node with child nodes, but expected to get a leaf node");
      }
    } else {
      return { node: null, offset };
    }
  }

  clearSelection(): number {
    return setTimeout(() => {
      this.removeAttribute('start');
      this.removeAttribute('end');
      this.dispatchEvent(new CustomEvent('clear'));
    }, 10);
  }

  clampRangePoint(edge: { node: Element, offset: number }): { node: Element, offset: number } {
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

  selectedTextDidChange() {
    if (this.didSetSelection) {
      this.didSetSelection = false;
      return true;
    }

    let range = document.getSelection();
    let nodes = this.textNodes;
    let [base, extent] = [
      this.getNodeAndOffset(range.baseNode, range.baseOffset),
      this.getNodeAndOffset(range.extentNode, range.extentOffset)
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
      this._clearTimer = this.clearSelection();
      return true;
    }

    let domRange = document.createRange();
    domRange.setStart(base.node, base.offset);
    domRange.setEnd(extent.node, extent.offset);

    let commonAncestor = domRange.commonAncestorContainer;

    if (!this.contains(commonAncestor) && !commonAncestor.contains(this)) {
      this._clearTimer = this.clearSelection();
      return true;
    }

    // Fix the base and offset nodes
    if (!this.contains(commonAncestor) && this !== commonAncestor) {
      base = this.clampRangePoint(base);
      extent = this.clampRangePoint(extent);
    }

    let lengths = nodes.map((node) => node.nodeValue.length);
    let start = lengths.slice(0, nodes.indexOf(base.node)).reduce(sum, base.offset);
    let end = lengths.slice(0, nodes.indexOf(extent.node)).reduce(sum, extent.offset);

    if (start === end && isNonZeroRange) {
      this._clearTimer = this.clearSelection();
      return true;
    }
    clearTimeout(this._clearTimer);

    this.setAttribute('start', start);
    this.setAttribute('end', end);
    this.dispatchEvent(new CustomEvent('change', { detail: { start, end } }));
    return true;
  }
}

customElements.define('text-selection', TextSelection);

export default TextSelection;
