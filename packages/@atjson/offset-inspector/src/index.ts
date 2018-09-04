import Document from '@atjson/document';
import CommonmarkRenderer from '@atjson/renderer-commonmark';
import InspectorGadget from './document-inspector';
import './document-inspector';
import './html-tree-inspector';
import WebComponent from './mixins/component';

export default class OffsetEditorDemo extends WebComponent {
  static template = '<h1><offset-logo></offset-logo></h1>' +
                    '<div class="demo">' +
                      '<section class="editor">' +
                        '<header class="tabs">' +
                          '<div class="editor-tab active" data-target="editor-container">Editor</div>' +
                          '<div class="html-tab" data-target="html-container">HTML</div>' +
                          '<div class="commonmark-tab" data-target="commonmark-container">Commonmark</div>' +
                        '</header>' +
                        '<section class="editor-container active"><slot></slot></section>' +
                        '<section class="html-container"><html-tree-inspector></html-tree-inspector></section>' +
                        '<section class="commonmark-container"><div class="markdown"></div></section>' +
                      '</section>' +
                      '<section class="inspector">' +
                        '<section class="inspector-gadget"><inspector-gadget></inspector-gadget></section>' +
                      '</section>' +
                    '</div>';

  static events = {
    'change': 'renderAll',

    'click .tabs'(event) {
      let targetTabClass = event.path[0].getAttribute('data-target');
      let active = this.shadowRoot.querySelector('.editor > .active');
      if (active) {
        active.classList.remove('active');
      }
      this.shadowRoot.querySelector('.editor > .' + targetTabClass).classList.add('active');
      this.shadowRoot.querySelector('.editor > .tabs > .active').classList.remove('active');
      event.path[0].classList.add('active');

      this.renderAll();
    },

    'addComponent'(event) {
      this.shadowRoot.querySelector('html-tree-inspector').addComponent(event.detail.component);
    }
  };

  static style = `
    :host {
      max-height: 100vh;
      max-width: 100vw;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
    }

    :host > h1 {
      padding: 1ex;
      margin: 0;
      border-bottom: 1px solid #bbb;
      background-color: #f3f3f3
    }

    .demo {
      display: flex;
      flex-direction: row;
      margin: 0;
      padding: 0;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
    }

    .demo > section {
      position: relative;
      flex-grow: 1;
      max-height: 100%;
      width: 50%;
    }

    .editor {
      padding-right: 1px;
      padding-bottom: 2em;
      border-right: 1px solid #ccc;
    }

    .tabs {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      background-color: #f3f3f3;
      color: #333;
      font-family: 'Segoe UI', Tahoma, sans-serif;
      height: 26px;
      line-height: 15px;
      font-size: 12px;
      border-bottom: 1px solid #ccc;
      position: sticky;
      top: 0;
    }

    .tabs > div {
      padding: 4px 1em;
      border-bottom: 1px solid #ccc;
    }

    .tabs > div:hover {
      background-color: #eaeaea;
      cursor: pointer;
    }

    .tabs > .active {
      border-bottom: 2px solid #03a9f4;
    }

    .editor > section {
      display: none;
      overflow-y: auto;
      position: relative;
      max-height: calc(100% - 24px);
      box-sizing: border-box;
      padding: 1em;
    }

    .editor > section.active {
      display: inherit;
    }

    .markdown {
      white-space: pre-wrap;
      font-family: Consolas, Lucida Console, Courier New, monospace;
    }
  `;

  _pendingCallback: () => void;
  _document?: Document;

  renderAll(evt?: CustomEvent) {

    if (evt) this._document = evt.detail.document;

    let doc: Document;
    if (this._document instanceof Document) {
      doc = this._document;
    } else {
      return;
    }

    if (this._pendingCallback) return;

    this._pendingCallback = () => {
      this.updateHtmlTreeInspector(doc);
      this.renderMarkdown(doc);
      this.renderInspector(doc);
      delete this._pendingCallback;
    };

    window.requestIdleCallback(this._pendingCallback);
  }

  renderMarkdown(doc: Document) {
    if (this.activeTab('commonmark-tab')) {
      let outputElement = this.shadowRoot.querySelector('.markdown');
      let rendered = new CommonmarkRenderer().render(doc);
      if (outputElement) {
        outputElement.textContent = rendered;
      }
    }
  }

  renderInspector(doc: Document) {
    // This is really ineffecient, because we're calling it every document
    // change at the moment. To fix this, we need a new "changedocument" or
    // similar event on the editor.
    let inspectorGadget: InspectorGadget = this.shadowRoot.querySelector('inspector-gadget');
    let editor = this.querySelector('offset-editor');

    if (inspectorGadget) {
      inspectorGadget.setDocument(doc);
      inspectorGadget.setSelection(editor.getSelection());
    }
  }

  updateHtmlTreeInspector(doc: Document) {
    if (this.activeTab('html-tab')) {
      this.shadowRoot.querySelector('html-tree-inspector').dispatchEvent(
        new CustomEvent('change', {detail: {document: doc}})
      );
    }
  }

  activeTab(wanted: string) {
    let activeTab = this.shadowRoot.querySelector('.tabs > .active');
    if (activeTab) {
      return activeTab.classList.contains(wanted);
    } else {
      return false;
    }
  }
}

if (!window.customElements.get('offset-editor-demo')) {
  window.customElements.define('offset-editor-demo', OffsetEditorDemo);
}
