import OffsetSource from '@atjson/offset-annotations';
import { Image } from './annotations';
import CommonmarkSource from './source';

CommonmarkSource.defineConverterTo(OffsetSource, doc => {
  doc.where({ type: '-commonmark-blockquote' }).set({ type: '-offset-Blockquote' });
  doc.where({ type: '-commonmark-bullet_list' }).set({ type: '-offset-List', attributes: { '-offset-type': 'bulleted' } }).rename({ attributes: { '-commonmark-tight': '-offset-tight' } });
  doc.where({ type: '-commonmark-code_block' }).set({ type: '-offset-Code', attributes: { '-offset-style': 'block' } });
  doc.where({ type: '-commonmark-code_inline' }).set({ type: '-offset-Code', attributes: { '-offset-style': 'inline' } });
  doc.where({ type: '-commonmark-em' }).set({ type: '-offset-Italic' });
  doc.where({ type: '-commonmark-fence' }).set({ type: '-offset-Code', attributes: { '-offset-style': 'fence' } }).rename({ attributes: { '-commonmark-info': '-offset-info' }});
  doc.where({ type: '-commonmark-hardbreak' }).set({ type: '-offset-LineBreak' });
  doc.where({ type: '-commonmark-heading' }).set({ type: '-offset-Heading' }).rename({ attributes: { '-commonmark-level': '-offset-level' } });
  doc.where({ type: '-commonmark-hr' }).set({ type: '-offset-HorizontalRule' });
  doc.where({ type: '-commonmark-html_block' }).set({ type: '-offset-HTML', attributes: { '-offset-style': 'block' } });
  doc.where({ type: '-commonmark-html_inline' }).set({ type: '-offset-HTML', attributes: { '-offset-style': 'inline' } });
  doc.where({ type: '-commonmark-image' }).update((image: Image) => {
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
  doc.where({ type: '-commonmark-link' }).set({ type: '-offset-Link' }).rename({ attributes: { '-commonmark-href': '-offset-url', '-commonmark-title': '-offset-title' } });
  doc.where({ type: '-commonmark-list_item' }).set({ type: '-offset-ListItem' });
  doc.where({ type: '-commonmark-ordered_list' }).set({ type: '-offset-List', attributes: { '-offset-type': 'numbered' } }).rename({ attributes: { '-commonmark-start': '-offset-startsAt', '-commonmark-tight': '-offset-tight' } });
  doc.where({ type: '-commonmark-paragraph' }).set({ type: '-offset-Paragraph' });
  doc.where({ type: '-commonmark-strong' }).set({ type: '-offset-Bold' });

  return doc;
});
