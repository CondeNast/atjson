import OffsetSource from '@atjson/offset-annotations';
import { Image, OrderedList } from './annotations';
import HTMLSource from './source';

HTMLSource.defineConverterTo(OffsetSource, doc => {
  doc.where({ type: '-html-a' }).set({ type: '-offset-Link' }).rename({ attributes: { '-html-href': '-offset-url' } });

  doc.where({ type: '-html-blockquote' }).set({ type: '-offset-Blockquote' });

  doc.where({ type: '-html-h1' }).set({ type: '-offset-Heading', attributes: { '-offset-level': 1 } });
  doc.where({ type: '-html-h2' }).set({ type: '-offset-Heading', attributes: { '-offset-level': 2 } });
  doc.where({ type: '-html-h3' }).set({ type: '-offset-Heading', attributes: { '-offset-level': 3 } });
  doc.where({ type: '-html-h4' }).set({ type: '-offset-Heading', attributes: { '-offset-level': 4 } });
  doc.where({ type: '-html-h5' }).set({ type: '-offset-Heading', attributes: { '-offset-level': 5 } });
  doc.where({ type: '-html-h6' }).set({ type: '-offset-Heading', attributes: { '-offset-level': 6 } });

  doc.where({ type: '-html-p' }).set({ type: '-offset-Paragraph' });
  doc.where({ type: '-html-br' }).set({ type: '-offset-LineBreak' });
  doc.where({ type: '-html-hr' }).set({ type: '-offset-HorizontalRule' });

  doc.where({ type: '-html-ul' }).set({ type: '-offset-List', attributes: { '-offset-type': 'bulleted' } });
  doc.where({ type: '-html-ol' }).update((list: OrderedList) => {
    doc.replaceAnnotation(list, {
      id: list.id,
      type: '-offset-List',
      start: list.start,
      end: list.end,
      attributes: {
        '-offset-type': 'numbered',
        '-offset-startsAt': parseInt(list.attributes.starts || '0', 10)
      }
    });
  });
  doc.where({ type: '-html-li' }).set({ type: '-offset-ListItem' });

  doc.where({ type: '-html-em' }).set({ type: '-offset-Italic' });
  doc.where({ type: '-html-i' }).set({ type: '-offset-Italic' });
  doc.where({ type: '-html-strong' }).set({ type: '-offset-Bold' });
  doc.where({ type: '-html-b' }).set({ type: '-offset-Bold' });
  doc.where({ type: '-html-del' }).set({ type: '-offset-Strikethrough' });
  doc.where({ type: '-html-sub' }).set({ type: '-offset-Subscript' });
  doc.where({ type: '-html-sup' }).set({ type: '-offset-Superscript' });
  doc.where({ type: '-html-u' }).set({ type: '-offset-Underline' });

  doc.where({ type: '-html-img' }).update((image: Image) => {
    doc.replaceAnnotation(image, {
      id: image.id,
      type: '-offset-Image',
      start: image.start,
      end: image.end,
      attributes: {
        '-offset-url': image.attributes.src,
        '-offset-title': image.attributes.title,
        '-offset-description': {
          content: image.attributes.alt,
          annotations: []
        }
      }
    });
  });

  return doc;
});
