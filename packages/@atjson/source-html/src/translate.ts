import OffsetSource from '@atjson/offset-annotations'
import { OrderedList } from './annotations';
import CommonMarkSource from './index';

export default function(document: CommonMarkSource) {
  let doc = document.clone();

  doc.where({ type: '-html-a' }).set({ type: '-offset-link' }).rename({ attributes: { '-html-href': '-offset-url' } });

  doc.where({ type: '-html-blockquote' }).set({ type: '-offset-blockquote' });

  doc.where({ type: '-html-h1' }).set({ type: '-offset-heading', attributes: { '-offset-level': 1 } });
  doc.where({ type: '-html-h2' }).set({ type: '-offset-heading', attributes: { '-offset-level': 2 } });
  doc.where({ type: '-html-h3' }).set({ type: '-offset-heading', attributes: { '-offset-level': 3 } });
  doc.where({ type: '-html-h4' }).set({ type: '-offset-heading', attributes: { '-offset-level': 4 } });
  doc.where({ type: '-html-h5' }).set({ type: '-offset-heading', attributes: { '-offset-level': 5 } });
  doc.where({ type: '-html-h6' }).set({ type: '-offset-heading', attributes: { '-offset-level': 6 } });

  doc.where({ type: '-html-p' }).set({ type: '-offset-paragraph' });
  doc.where({ type: '-html-br' }).set({ type: '-offset-line-break' });
  doc.where({ type: '-html-hr' }).set({ type: '-offset-horizontal-rule' });

  doc.where({ type: '-html-ul' }).set({ type: '-offset-list', attributes: { '-offset-type': 'bulleted' } });
  doc.where({ type: '-html-ol' }).update((list: OrderedList) => {
    doc.replaceAnnotation(list, {
      id: list.id,
      type: '-offset-list',
      start: list.start,
      end: list.end,
      attributes: {
        '-offset-type': 'numbered',
        '-offset-startsAt': parseInt(list.attributes.starts || '0', 10)
      }
    });
  });
  doc.where({ type: '-html-li' }).set({ type: '-offset-list-item' });

  doc.where({ type: '-html-em' }).set({ type: '-offset-italic' });
  doc.where({ type: '-html-i' }).set({ type: '-offset-italic' });
  doc.where({ type: '-html-strong' }).set({ type: '-offset-bold' });
  doc.where({ type: '-html-b' }).set({ type: '-offset-bold' });
  doc.where({ type: '-html-del' }).set({ type: '-offset-strikethrough' });
  doc.where({ type: '-html-sub' }).set({ type: '-offset-subscript' });
  doc.where({ type: '-html-sup' }).set({ type: '-offset-superscript' });
  doc.where({ type: '-html-u' }).set({ type: '-offset-underline' });

  doc.where({ type: '-html-img' }).set({ type: '-offset-image' }).rename({
    attributes: {
      '-html-src': '-offset-url',
      '-html-title': '-offset-title',
      '-html-alt': '-offset-description'
    }
  });
  return new OffsetSource(doc.toJSON());
}
