import Document from '@atjson/document';
import CommonmarkRenderer from '@atjson/renderer-commonmark';
import WebComponentRenderer from '@atjson/renderer-webcomponent';
import '../public/logo';
import '../src/index';
import WebComponent from '../src/mixins/component';
import '../utils/inspector-gadget';
import InspectorGadget from '../utils/inspector-gadget';

export default class OffsetEditorDemo extends WebComponent {
  static template = '<h1><offset-logo></offset-logo></h1><slot></slot>' +
                    '<h1>HTML Output</h1><div class="output"></div>' +
                    '<h1>Commonmark Output</h1><div class="markdown"></div>' +
                    '<inspector-gadget></inspector-gadget>';

  static events = {
    'change'(evt: CustomEvent) {
      console.log('GOT CHANGE!', evt);
      this.renderOutput(evt.detail.document);
      this.renderMarkdown(evt.detail.document);
      this.renderInspector(evt.detail.document);
    }
  };

  renderOutput(doc: Document) {
    let outputElement = this.shadowRoot.querySelector('.output');
    let rendered = new WebComponentRenderer(doc).render();
    if (outputElement) {
      outputElement.innerHTML = rendered.innerHTML;
    }
  }

  renderMarkdown(doc: Document) {
    let outputElement = this.shadowRoot.querySelector('.markdown');
    let rendered = new CommonmarkRenderer().render(doc);
    if (outputElement) {
      outputElement.innerHTML = rendered;
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
}

if (!window.customElements.get('offset-editor-demo')) {
  window.customElements.define('offset-editor-demo', OffsetEditorDemo);
}
