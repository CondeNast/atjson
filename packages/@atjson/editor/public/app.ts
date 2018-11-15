import OffsetSource, { Bold, Italic, Link, Paragraph, Underline } from '@atjson/offset-annotations';
import { OffsetEditor } from '../src';
import './logo';

if (!window.customElements.get('offset-editor')) {
  window.customElements.define('offset-editor', OffsetEditor);
}

document.addEventListener('DOMContentLoaded', () => {
  let editor: OffsetEditor = document.querySelector('offset-editor');

  let doc = new URL(location.toString()).searchParams.get('document');
  if (doc) {
    editor.value = new OffsetSource(JSON.parse(doc));
  } else {
    editor.value = new OffsetSource({
      content: 'Some text that is both bold and italic plus something after.',
      annotations: [
        new Bold({ start: 23, end: 31 }),
        new Link({ start: 20, end: 24, attributes: { url: 'https://google.com' } }),
        new Italic({ start: 28, end: 38 }),
        new Underline({ start: 28, end: 38 }),
        new Paragraph({ start: 0, end: 61 })
      ]
    });
  }
});
