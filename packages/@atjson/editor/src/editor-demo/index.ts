import Document from '@atjson/document';
import CommonmarkRenderer from '@atjson/renderer-commonmark';
import OffsetLogo from '../components/logo';
import Editor from '../index';
import InspectorGadget from '../inspector-gadget';
import events from '../mixins/events';
import WebComponentRenderer from '../webcomponent-renderer';

import EditableLink from '../components/editable-link';

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
    'change text-editor'(evt: CustomEvent) {
      this.renderOutput(evt.detail.document);
      this.renderMarkdown(evt.detail.document);
    }
  };

  renderOutput(doc: Document) {
    let outputElement = this.querySelector('.output');
    let rendered = new WebComponentRenderer(doc).render();
    if (outputElement) {
      outputElement.innerHTML = rendered.innerHTML;
    }
  }

  renderMarkdown(doc: Document) {
    let outputElement = this.querySelector('.markdown');
    let rendered = new CommonmarkRenderer().render(doc);
    if (outputElement) {
      outputElement.innerHTML = rendered;
    }
  }

  setDocument(doc: Document) {
    let editor = this.querySelector('text-editor');

    if (editor === null) return;

    editor.setDocument(doc);

    let inspectorGadget = this.querySelector('inspector-gadget');

    if (inspectorGadget) {
      inspectorGadget.setDocument(doc);
      inspectorGadget.setSelection(editor.getSelection());
    }

    doc.addEventListener('change', () => {
      let logo = this.querySelector('offset-logo');
      if (logo) {
         logo.setAttribute('offset', doc.content.length);
      }
    });
  }

  connectedCallback() {
    this.innerHTML = this.constructor.template;

    let editor = this.querySelector('text-editor');

    if (editor) {
      editor.addContentFeature(EditableLink);
    }

    super.connectedCallback();
  }
}

if (!window.customElements.get('text-editor-demo')) {
  window.customElements.define('text-editor-demo', EditorDemo);
}
