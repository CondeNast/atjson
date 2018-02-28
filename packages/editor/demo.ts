import Document from '@atjson/document';
import './src/index';

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
