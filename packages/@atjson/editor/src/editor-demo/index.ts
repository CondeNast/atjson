import Document from '@atjson/document';
import Editor from '../index';
import WebComponentRenderer from '../webcomponent-renderer';
import CommonmarkRenderer from '@atjson/renderer-commonmark';
import InspectorGadget from '../inspector-gadget';
import OffsetLogo from './logo';
import events from '../mixins/events';

if (!window.customElements.get('text-editor')) {
  window.customElements.define('text-editor', Editor);
}

if (!window.customElements.get('inspector-gadget')) {
  window.customElements.define('inspector-gadget', InspectorGadget);
}

if (!window.customElements.get('offset-logo')) {
  window.customElements.define('offset-logo', OffsetLogo);
}

export default class EditorDemo extends events(HTMLElement) {
  static template = '<h1><offset-logo offset="0"></offset-logo></h1><text-editor></text-editor>' +
                    '<h1>HTML Output</h1><div class="output"></div>' + 
                    '<h1>Commonmark Output</h1><div class="markdown"></div>' +
                    '<inspector-gadget></inspector-gadget>';

  static events = {
    'change text-editor'(evt) {
      this.renderOutput(evt.detail.document);
      this.renderMarkdown(evt.detail.document);
    }
  }

  renderOutput(doc) {
    let outputElement = this.querySelector('.output');
    let rendered = new WebComponentRenderer(doc).render();
    outputElement.innerHTML = rendered.innerHTML;
  }

  renderMarkdown(doc) {
    let outputElement = this.querySelector('.markdown');
    let rendered = new CommonmarkRenderer().render(doc);
    outputElement.innerHTML = rendered;
  }

  setDocument(doc: Document) {
    let editor = this.querySelector('text-editor');
    editor.setDocument(doc);
    let inspectorGadget = this.querySelector('inspector-gadget');
    inspectorGadget.setDocument(doc);
    inspectorGadget.setSelection(editor.getSelection());

    doc.addEventListener('change', _ => {
			let logo = this.querySelector('offset-logo');
			logo.setAttribute('offset', doc.content.length)
    });
  }

  connectedCallback() {
    this.innerHTML = this.constructor.template;
    super.connectedCallback();
  }
}

if (!window.customElements.get('text-editor-demo')) {
  window.customElements.define('text-editor-demo', EditorDemo);
}
