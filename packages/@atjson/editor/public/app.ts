import OffsetSource from '@atjson/offset-annotations';
import { v4 as uuid } from 'uuid';
import OffsetEditor from '../src';
import Component from '../src/mixins/component'
import './logo';

if (!window.customElements.get('offset-editor')) {
  window.customElements.define('offset-editor', OffsetEditor);
}

document.addEventListener('DOMContentLoaded', () => {

  let editor: OffsetEditor = document.querySelector('offset-editor');

  let doc = new URL(location.toString()).searchParams.get('document');
  if (doc) {
    editor.setDocument(new OffsetSource(JSON.parse(doc)));
  } else {
    editor.setDocument(new OffsetSource({
      content: 'Some text that is both bold and italic plus something after.',
      annotations: [
        { id: uuid(), type: '-offset-bold', start: 23, end: 31, attributes: {} },
        { id: uuid(), type: '-offset-link', start: 20, end: 24, attributes: { '-offset-url': 'https://google.com' } },
        { id: uuid(), type: '-offset-italic', start: 28, end: 38, attributes: {} },
        { id: uuid(), type: '-offset-underline', start: 28, end: 38, attributes: {} },
        { id: uuid(), type: '-offset-paragraph', start: 0, end: 61, attributes: {} }
      ]
    }));
  }
});
