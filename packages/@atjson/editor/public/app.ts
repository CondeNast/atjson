import Document from '@atjson/document';
import EditorDemo from '../src/editor-demo';

if (!window.customElements.get('text-editor-demo')) {
  window.customElements.define('text-editor-demo', EditorDemo);
}

// Web components in the registry can't be redefined,
// so reload the page on every change
if (module.hot) {
  module.hot.dispose(function () {
    window.location.reload();
  });
}

document.addEventListener('DOMContentLoaded', function () {
  let editor: EditorDemo = document.querySelector('text-editor-demo');
  let doc = new URL(location.toString()).searchParams.get('document');
  if (doc) {
    editor.setDocument(new Document(JSON.parse(doc)));
  } else {
    let doc = new Document({
      content: 'Some text that is both bold and italic plus something after.\nA second paragraph.',
      annotations: [
        { type: 'bold', display: 'inline', start: 23, end: 31 },
        { type: 'italic', display: 'inline', start: 28, end: 38 },
        { type: 'underline', display: 'inline', start: 28, end: 38 },
        { type: 'paragraph', display: 'block', start: 0, end: 61 },
        { type: 'paragraph', display: 'block', start: 61, end: 80 }
      ]
    });

    editor.setDocument(doc);
  }
});
