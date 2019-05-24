import Component, { define } from '../component';
import { getOffset, getTextNodes } from '../lib/selection';

/**
 * Events available for listening for <text-selection>:
 *
 * @emits CustomEvent#change - called when the text selection changes
 * @emits CustomEvent#clear - called when the text selection is cleared
 */
export default define('text-selection', class TextSelection extends Component {
  static template = '<slot></slot>';
  static observedAttributes = ['start', 'end'];
  static events = {
    'selectionchange document'(this: TextSelection) {
      if (this.composing) return;

      let selection = document.getSelection();
      let nodes = this.textNodes;

      if (selection == null) return;
      let offset = getOffset(this, nodes, selection);

      if (offset == null) {
        if (offset === null) {
          this.removeAttribute('start');
          this.removeAttribute('end');
          this.dispatchEvent(new CustomEvent('clear'));
        }
      } else {
        this.setAttribute('start', offset.start.toString());
        this.setAttribute('end', offset.end.toString());
        this.dispatchEvent(new CustomEvent('change', {
          detail: {
            start: offset.start,
            end: offset.end,
            collapsed: offset.start === offset.end
          }
        }));
      }
    },
    'compositionstart'(this: TextSelection) {
      this.composing = true;
    },
    'compositionend'(this: TextSelection) {
      this.composing = false;
    }
  };

  private composing: boolean;
  private textNodes: Text[];
  private observer?: MutationObserver | null;

  constructor() {
    super();
    this.textNodes = [];
    this.composing = false;
  }

  connectedCallback() {
    super.connectedCallback();

    // Setup observers so when the underlying text changes,
    // we update the text nodes that we want to map our selection from
    this.observer = new MutationObserver(() => this.syncTextNodes());
    this.observer.observe(this, { childList: true, characterData: true, subtree: true });

    this.syncTextNodes();
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.textNodes = [];
  }

  setSelection(range: { start: number, end: number }) {
    // We need to do a force-reset here in order to avoid waiting for a full
    // cycle of the browser event loop. The DOM has changed, but if we wait
    // for the TextSelection MutationObserver to fire, the TextSelection
    // model will have an old set of nodes (since we've just replaced them
    // with new ones).
    //
    // PERF In the event of performance issues, this is a good candidate for
    // optimization.
    this.syncTextNodes();

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

        if (selection) {
          selection.removeAllRanges();
          selection.addRange(r);
        }
        break;
      }

      offset += (node.nodeValue || '').length;
    }
  }

  private syncTextNodes() {
    this.textNodes = getTextNodes(this);
  }
});
