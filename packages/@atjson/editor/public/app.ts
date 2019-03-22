import OffsetSource, { Bold, Italic, Link, Paragraph, Underline } from '@atjson/offset-annotations';
import '../src/components/offset-editor';
import './logo';

// Web components in the registry can't be redefined,
// so reload the page on every change
if (module.hot) {
  module.hot.dispose(() => {
    window.location.reload();
  });
}

document.addEventListener('DOMContentLoaded', () => {

  let editor: OffsetEditor = document.querySelector('offset-editor');

  let param = new URL(location.toString()).searchParams.get('document');
  if (param) {
    editor.setDocument(new OffsetSource(JSON.parse(param)));
  } else {
    let doc = new OffsetSource({
      content: 'Some text that is both bold and italic plus something after.',
      annotations: [
        new Bold({ start: 23, end: 31 }),
        new Link({ start: 20, end: 24, attributes: { url: 'https://google.com' } }),
        new Italic({ start: 28, end: 38 }),
        new Underline({ start: 28, end: 38 }),
        new Paragraph({ start: 0, end: 61 })
      ]
    });

    editor.setDocument(doc);
  }
});
