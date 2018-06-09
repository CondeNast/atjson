import Document from '@atjson/document';
import Editor from './index';
import WebComponentRenderer from './webcomponent-renderer';
import InspectorGadget from './inspector-gadget';
import events from './mixins/events';

if (!window.customElements.get('text-editor')) {
  window.customElements.define('text-editor', Editor);
}

if (!window.customElements.get('inspector-gadget')) {
  window.customElements.define('inspector-gadget', InspectorGadget);
}

export default class EditorDemo extends events(HTMLElement) {
  static template = '<text-editor></text-editor>' +
                    '<div class="output"></div>' + 
                    '<inspector-gadget></inspector-gadget>';

  static events = {
    'change text-editor'(evt) {
      console.log('got change event');
      this.renderOutput(evt.detail.document);
    }
  }

  renderOutput(doc) {
    let outputElement = this.querySelector('.output');
    let rendered = new WebComponentRenderer(doc).render();
    this.querySelector('.output').innerHTML = rendered.innerHTML;
  }

  setDocument(doc: Document) {
    let editor = this.querySelector('text-editor');
    editor.setDocument(doc);
    let inspectorGadget = this.querySelector('inspector-gadget');
    inspectorGadget.setDocument(doc);
    inspectorGadget.setSelection(editor.getSelection());
  }

  connectedCallback() {
    this.innerHTML = this.constructor.template;
    super.connectedCallback();
  }
}

console.log('loaded yo');
if (!window.customElements.get('text-editor-demo')) {
  console.log('defineingadfj');
  window.customElements.define('text-editor-demo', EditorDemo);
}
