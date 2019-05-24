import AtJSONDocument from '@atjson/document';
import WebComponentRenderer from '@atjson/renderer-webcomponent';
import Component, { define } from '../component';
import { getOffset, getTextNodes } from '../lib/selection';

interface DOMInputEventLvl2 extends InputEvent {
  dataTransfer: DataTransfer;
  inputType: string;
  getTargetRanges: () => Range[];
}

export default define('offset-editor', class OffsetEditor extends Component {
  static template = '<slot></slot>';
  static events = {
    'selectionchange document'(this: OffsetEditor) {
      if (this.composing) return;

      let selection = document.getSelection();
      let nodes = this.textNodes;

      if (selection == null) return;
      let offset = getOffset(this, nodes, selection);

      if (offset == null) {
        if (offset === null) {
          this.removeAttribute('start');
          this.removeAttribute('end');
          this.cursor = null;
          this.dispatchEvent(new CustomEvent('clear'));
        }
      } else {
        this.setAttribute('start', offset.start.toString());
        this.setAttribute('end', offset.end.toString());
        this.cursor = offset;
        this.dispatchEvent(new CustomEvent('change', {
          detail: {
            start: offset.start,
            end: offset.end,
            collapsed: offset.start === offset.end
          }
        }));
      }
    },
    'compositionstart'(this: OffsetEditor) {
      this.composing = true;
    },
    'compositionend'(this: OffsetEditor) {
      this.composing = false;
    },
    'beforeInput'(this: OffsetEditor, evt: DOMInputEventLvl2) {
      if (this.cursor == null) return;

      let { start, end } = this.cursor;

      if (evt.inputType === 'insertFromPaste') {
        let mimeTypes = evt.dataTransfer.types;
        let matchedMimeType = mimeTypes.find(mimeType => {
          return this.pasteHandlers[mimeType] !== null;
        });

        if (matchedMimeType) {
          let data = evt.dataTransfer.getData(matchedMimeType);
          let result = this.pasteHandlers[matchedMimeType].fromRaw(data);
          if (start === end) {
            this.document.insertText(start, result.content);
          } else {
            this.document.insertText(end, result.content);
            this.document.deleteText(start, end);
          }
        } else {
          let text = evt.dataTransfer.getData('text/plain');
          if (start === end) {
            this.dispatchEvent(new CustomEvent('insertText', { bubbles: true, detail: { position: start, text } }));
          } else {
            this.dispatchEvent(new CustomEvent('replaceText', { bubbles: true, detail: { start, end, text } }));
          }
        }
      }
    }
  };

  document: AtJSONDocument;

  private composing: boolean;
  private textNodes: Text[];
  private observer?: MutationObserver | null;
  private cursor?: { start: number, end: number } | null;
  private pasteHandlers: {
    [mimeType: string]: typeof AtJSONDocument & { fromRaw(data: any): AtJSONDocument; }
  };

  constructor() {
    super();
    this.textNodes = [];
    this.composing = false;
    this.document = new AtJSONDocument({ content: '', annotations: [] });
    this.pasteHandlers = {};
  }

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('contenteditable', 'true');

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

  scheduleRender() {
    window.requestAnimationFrame(() => {
      this.render();
      let evt = new CustomEvent('change', { bubbles: true, composed: true, detail: { document: this.document } });
      this.dispatchEvent(evt);
    });
  }

  registerPasteHandler(mimeType: string, source: typeof AtJSONDocument & { fromRaw(data: any): AtJSONDocument; }) {
    this.pasteHandlers[mimeType] = source;
  }

  render() {
    let rendered = new WebComponentRenderer(this.document).render();

    // This can be improved by doing the comparison on an element-by-element
    // basis (or by rendering incrementally via the HIR), but for now this will
    // prevent flickering of OS UI elements (e.g., spell check) while typing
    // characters that don't result in changes outside of text elements.
    if (rendered.innerHTML !== this.innerHTML) {
      this.innerHTML = rendered.innerHTML;

      if (this.cursor) {
        this.setSelection(this.cursor);
      }
    }
  }

  setDocument(value: AtJSONDocument) {
    this.document = value;
    this.document.addEventListener('change', () => this.scheduleRender());
    this.scheduleRender();
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
