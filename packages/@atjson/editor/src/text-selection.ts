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

interface Range {
  start: number;
  end: number;
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
 * Events available for listening for <text-selection>:
 *
 * @emits CustomEvent#change - called when the text selection changes
 * @emits CustomEvent#clear - called when the text selecton is cleared
 */
class TextSelection extends events(HTMLElement) {

  static observedAttributes = ['start', 'end'];
  static events = {
    'selectionchange document': 'selectedTextDidChange',
    'compositionstart': 'startComposition',
    'compositionend': 'endComposition',
    'resumeinput': 'resumeInput'
  };

  composing: boolean;
  private _cursorToolbarResetTimeout: any;

  private textNodes: Text[];
  private observer?: MutationObserver | null;
  private _focusNode?: Node | Text | null;
  private _previousRange?: any;

  constructor() {
    super();
    this.textNodes = [];
    this.composing = false;
  }

  startComposition() {
    this.composing = true;
  }

  endComposition() {
    this.composing = false;
  }

  setSelection(range: Range) {
    // We need to do a force-reset here in order to avoid waiting for a full
    // cycle of the browser event loop. The DOM has changed, but if we wait
    // for the TextSelection MutationObserver to fire, the TextSelection
    // model will have an old set of nodes (since we've just replaced them
    // with new ones).
    //
    // PERF In the event of performance issues, this is a good candidate for
    // optimization.
    this.reset();

    let l = this.textNodes.length;
    let offset = 0;

    for (let i = 0; i < l; i++) {
      let node = this.textNodes[i];

      if (offset + (node.nodeValue || '').length >= range.start) {
        let selection = document.getSelection();
        let r = document.createRange();
        r.setStart(node, range.start - offset);

        if (node.parentNode instanceof HTMLElement) {
          node.parentNode.focus();
        }

        selection.removeAllRanges();
        selection.addRange(r);
        break;
      }

      offset += (node.nodeValue || '').length;
    }
  }

  connectedCallback() {
    super.connectedCallback();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let template = document.createElement('template');
    template.innerHTML = '<style>.toolbar { position: absolute; display: none; }</style><div class="toolbar"><slot name="toolbar"></slot></div><slot></slot>';
    shadowRoot.appendChild(template.content.cloneNode(true));

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

  // Handle cursor focus/blur events for elements at a cursor position.
  handleCursorFocus(range: Range, selectionRange: Selection) {

    // If we're focused on a text node, that means we have a cursor.
    if (selectionRange.focusNode.nodeType === 3) {

      // First, clear any existing focus. We do this first because in the next step, we reset it.
      if (this._focusNode && (this._focusNode !== selectionRange.focusNode || range.start !== range.end)) {
        this._focusNode.dispatchEvent(new CustomEvent('cursorblur', { bubbles: true }));
        delete this._focusNode;
      }

      // If we have a collapsed range.
      if (range.start === range.end) {

        if (!this._previousRange || range.start !== this._previousRange.start) {
          // And the focused node is *not* the same as the previously focused node.
          if (this._focusNode !== selectionRange.focusNode) {

            // then fire a focus event for parents of this text node to pick up.
            this._focusNode = selectionRange.focusNode;
            this._previousRange = range;
            this._focusNode.dispatchEvent(new CustomEvent('cursorfocus', { bubbles: true }));
          }
        } else {

          // We don't want to re-fire (this case is likely encountered in a
          // re-render), but since we don't have a _focusNode we just reset it
          // here to prevent re-firing on the next selection change.
          if (!this._focusNode) this._focusNode = selectionRange.focusNode;
        }
      }
    }
  }

  updateToolbar(range: Range, selectionRange: Selection) {
    if (!this.shadowRoot) return;

    let toolbar: HTMLElement | null = this.shadowRoot.querySelector('.toolbar');

    if (!toolbar) return;

    let toolbarStyle = toolbar.style;
    if (range.start === range.end) {
      toolbarStyle.display = 'none';
    } else {
      window.requestAnimationFrame(_ => {
        if (!toolbar) return;
        let selectionBoundingRect = selectionRange.getRangeAt(0).getBoundingClientRect();
        toolbarStyle.display = 'block';
        toolbarStyle.top = (selectionBoundingRect.top - toolbar.offsetHeight - 3).toString();
        toolbarStyle.left = selectionBoundingRect.left.toString();
      });
    }
  }

  resumeInput() {
    if (this._previousRange) {
      this.setSelection(this._previousRange);
      if (this._focusNode) {
        this._focusNode.dispatchEvent(new CustomEvent('cursorblur', { bubbles: true }));
      }
    }
  }

  private getNodeAndOffset([node, offset]: NodeRangePoint, leading: boolean): TextRangePoint | never | null {
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

  private clampRangePoint([text, offset]: TextRangePoint): TextRangePoint {
    if (text == null) {
      return [text, offset];
    }
    let firstNode = this.textNodes[0];
    let lastNode = this.textNodes[this.textNodes.length - 1];

    if (firstNode.compareDocumentPosition(text) === DOCUMENT_POSITION_PRECEDING) {
      return [firstNode, 0];

    } else if (lastNode.compareDocumentPosition(text) === DOCUMENT_POSITION_FOLLOWING) {
      return [lastNode, lastNode.length];

    }
    return [text, offset];
  }

  private clearSelection() {
    this.removeAttribute('start');
    this.removeAttribute('end');
    this.dispatchEvent(new CustomEvent('clear'));
  }

  // @ts-ignore called from events
  private selectedTextDidChange() {

    if (this.composing) return;

    let selection = document.getSelection();
    let nodes = this.textNodes;

    let nodeRange: NodeRange = [[selection.baseNode, selection.baseOffset],
                            [selection.extentNode, selection.extentOffset]];
    if (selection.anchorNode) {
      nodeRange = [[selection.anchorNode, selection.anchorOffset],
                   [selection.focusNode, selection.focusOffset]];
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
      this.clearSelection();
      return true;
    }

    let isNonZeroRange = startTextNode !== endTextNode || start[1] !== end[1];

    let domRange = document.createRange();
    if (startTextNode.parentNode instanceof Node && endTextNode.parentNode instanceof Node) {
      domRange.setStart(startTextNode.parentNode, start[1]);
      domRange.setEnd(endTextNode.parentNode, end[1]);
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

      let lengths = nodes.map(node => (node.nodeValue || '').length);
      let range = {
        start: lengths.slice(0, nodes.indexOf(startTextNode)).reduce(sum, start[1]),
        end: lengths.slice(0, nodes.indexOf(endTextNode)).reduce(sum, end[1])
      };

      if (range.start === range.end && isNonZeroRange) {
        return true;
      }

      clearTimeout(this._cursorToolbarResetTimeout);

      this._cursorToolbarResetTimeout = setTimeout(_ => {
        delete this._cursorToolbarResetTimeout;
        this.handleCursorFocus(range, selection);
        this.updateToolbar(range, selection);
      }, 500);

      this.setAttribute('start', range.start.toString());
      this.setAttribute('end', range.end.toString());
      this.dispatchEvent(new CustomEvent('change', {
        detail: {
          start: range.start,
          end: range.end,
          collapsed: range.start === range.end
        }
      }));
      return true;

    } else {
      throw new Error('This should not happen. This check is for typescript, but should never be triggered.');
    }
  }
}

customElements.define('text-selection', TextSelection);

export default TextSelection;
