import Document from '@atjson/document';
import './editor-demo';
import OffsetEditor from '../src';

import OffsetBlockquote from '../src/components/blockquote';
import OffsetBold from '../src/components/bold';
import OffsetColor from '../src/components/color';
import OffsetFont from '../src/components/font';
import OffsetHeading from '../src/components/heading';
import OffsetItalic from '../src/components/italic';
import OffsetLink from '../src/components/link';
import OffsetParagraphElement from '../src/components/paragraph';
import OffsetStrikethrough from '../src/components/strikethrough';
import OffsetUnderline from '../src/components/underline';

// Web components in the registry can't be redefined,
// so reload the page on every change
if (module.hot) {
  module.hot.dispose(() => {
    window.location.reload();
  });
}

document.addEventListener('DOMContentLoaded', () => {

  let editor: OffsetEditor = document.querySelector('offset-editor');
  editor.addContentFeature(OffsetParagraphElement);
  editor.addContentFeature(OffsetLink);
  editor.addContentFeature(OffsetBold);
  editor.addContentFeature(OffsetItalic);
  editor.addContentFeature(OffsetUnderline);
  editor.addContentFeature(OffsetStrikethrough);
  editor.addContentFeature(OffsetFont);
  editor.addContentFeature(OffsetColor);
  editor.addContentFeature(OffsetHeading);

  let doc = new URL(location.toString()).searchParams.get('document');
  if (doc) {
    editor.setDocument(new Document(JSON.parse(doc)));
  } else {
    let doc = new Document({
      content: 'Heading 1\nSome text that is both bold and italic plus something after.',
      annotations: [
        { type: 'bold', display: 'inline', start: 33, end: 41 },
        { type: 'link', display: 'inline', start: 30, end: 34, attributes: { url: 'https://google.com' } },
        { type: 'italic', display: 'inline', start: 38, end: 48 },
        { type: 'underline', display: 'inline', start: 38, end: 48 },
        { type: 'strikethrough', display: 'inline', start: 40, end: 50 },
        { type: 'font', display: 'inline', start: 15, end: 25, attributes: { 'font-family': 'Sans-serif', 'font-size': '200%' } },
        { type: 'color', display: 'inline', start: 20, end: 30, attributes: { } },
        { type: 'heading', display: 'block', start: 0, end: 10, attributes: { level: '1' } }
        { type: 'paragraph', display: 'block', start: 10, end: 71 }
      ]
    });

    editor.setDocument(doc);
  }
});
