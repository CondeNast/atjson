import { getConverterFor } from '@atjson/document';
import OffsetSource from '@atjson/offset-annotations';
import HTMLSource from '@atjson/source-html';
import PRISMSource from './source';

PRISMSource.defineConverterTo(OffsetSource, doc => {
  doc.where({ type: '-html-head' }).update(head => {
    doc.where(a => a.start >= head.start && a.end <= head.end).remove();
    doc.deleteText(head.start, head.end);
  });

  doc.where({ type: '-pam-media' }).update(media => {
    doc.where(a => a.start >= media.start && a.end <= media.end).remove();
    doc.deleteText(media.start, media.end);
  });

  let convertHTML = getConverterFor(HTMLSource, OffsetSource);
  return convertHTML(doc);
});
