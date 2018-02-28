import Document from '@atjson/document';
import Editor from './src/index';

if (!window.customElements.get('text-editor')) {
  window.customElements.define('text-editor', Editor);
}

// Web components in the registry can't be redefined,
// so reload the page on every change
if (module.hot) {
  module.hot.dispose(function () {
    window.location.reload();
  });
}

let doc = new Document({
  content: 'Hello, world',
  annotations: [{
    type: 'bold',
    start: 0,
    end: 5
  }]
});

let editor = document.createElement('text-editor');
editor.document = doc;
document.body.appendChild(editor);
