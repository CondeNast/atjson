import OffsetSource from '@atjson/offset-annotations';
import MobiledocSource from './source';

MobiledocSource.defineConverterTo(OffsetSource, doc => {
  doc.where({ type: '-mobiledoc-a' }).set({ type: '-offset-Link' }).rename({ attributes: { '-mobiledoc-href': '-offset-url' } });
  doc.where({ type: '-mobiledoc-aside' }).set({ type: '-offset-Pullquote' });
  doc.where({ type: '-mobiledoc-pull-quote' }).set({ type: '-offset-Pullquote' });

  doc.where({ type: '-mobiledoc-blockquote' }).set({ type: '-offset-Blockquote' });

  doc.where({ type: '-mobiledoc-h1' }).set({ type: '-offset-Heading', attributes: { '-offset-level': 1 } });
  doc.where({ type: '-mobiledoc-h2' }).set({ type: '-offset-Heading', attributes: { '-offset-level': 2 } });
  doc.where({ type: '-mobiledoc-h3' }).set({ type: '-offset-Heading', attributes: { '-offset-level': 3 } });
  doc.where({ type: '-mobiledoc-h4' }).set({ type: '-offset-Heading', attributes: { '-offset-level': 4 } });
  doc.where({ type: '-mobiledoc-h5' }).set({ type: '-offset-Heading', attributes: { '-offset-level': 5 } });
  doc.where({ type: '-mobiledoc-h6' }).set({ type: '-offset-Heading', attributes: { '-offset-level': 6 } });

  doc.where({ type: '-mobiledoc-p' }).set({ type: '-offset-Paragraph' });
  doc.where({ type: '-mobiledoc-br' }).set({ type: '-offset-LineBreak' });
  doc.where({ type: '-mobiledoc-hr' }).set({ type: '-offset-HorizontalRule' });

  doc.where({ type: '-mobiledoc-ul' }).set({ type: '-offset-List', attributes: { '-offset-type': 'bulleted' } });
  doc.where({ type: '-mobiledoc-ol' }).set({ type: '-offset-List', attributes: { '-offset-type': 'numbered' } });
  doc.where({ type: '-mobiledoc-li' }).set({ type: '-offset-ListItem' });

  doc.where({ type: '-mobiledoc-em' }).set({ type: '-offset-Italic' });
  doc.where({ type: '-mobiledoc-i' }).set({ type: '-offset-Italic' });
  doc.where({ type: '-mobiledoc-strong' }).set({ type: '-offset-Bold' });
  doc.where({ type: '-mobiledoc-b' }).set({ type: '-offset-Bold' });
  doc.where({ type: '-mobiledoc-del' }).set({ type: '-offset-Strikethrough' });
  doc.where({ type: '-mobiledoc-sub' }).set({ type: '-offset-Subscript' });
  doc.where({ type: '-mobiledoc-sup' }).set({ type: '-offset-Superscript' });
  doc.where({ type: '-mobiledoc-u' }).set({ type: '-offset-Underline' });

  doc.where({ type: '-mobiledoc-img' }).set({ type: '-offset-Image' }).rename({ attributes: { '-mobiledoc-src': '-offset-url' } });

  return doc;
});
