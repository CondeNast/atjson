import OffsetSource from '@atjson/offset-annotations';
import HTMLSource from '@atjson/source-html';
import PRISMSource from './source';

PRISMSource.defineConverterTo(OffsetSource, doc => {
  doc.where({ type: '-html-head' }).update(head => {
    doc.deleteText(head.start, head.end);
    doc.removeAnnotation(head);
  });

  doc.where({ type: '-pam-media' }).update(media => {
    doc.deleteText(media.start, media.end);
    doc.removeAnnotation(media);
  });

  return doc.convertTo(HTMLSource).convertTo(OffsetSource);
});
