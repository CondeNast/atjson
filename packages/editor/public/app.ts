import Document from '@atjson/document';
import Editor from '../src/index';

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

document.addEventListener('DOMContentLoaded', function () {
  let editor: Editor = document.querySelector('text-editor');
  let doc = new URL(location.toString()).searchParams.get('document');
  if (doc) {
    editor.setDocument(new Document(JSON.parse(doc)));
  } else {
    editor.setDocument(new Document({
      content: 'Hello, world'
    }));
  }
});