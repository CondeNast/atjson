import Document from '@atjson/document';
import { OrderedList } from './annotations';

export default function(document: Document) {
  let doc = document.clone();

  doc.where({ type: '-html-a' }).set({ type: 'link' }).rename({ attributes: { '-html-href': 'url' } });

  doc.where({ type: '-html-blockquote' }).set({ type: 'blockquote' });

  doc.where({ type: '-html-h1' }).set({ type: 'heading', attributes: { level: 1 } });
  doc.where({ type: '-html-h2' }).set({ type: 'heading', attributes: { level: 2 } });
  doc.where({ type: '-html-h3' }).set({ type: 'heading', attributes: { level: 3 } });
  doc.where({ type: '-html-h4' }).set({ type: 'heading', attributes: { level: 4 } });
  doc.where({ type: '-html-h5' }).set({ type: 'heading', attributes: { level: 5 } });
  doc.where({ type: '-html-h6' }).set({ type: 'heading', attributes: { level: 6 } });

  doc.where({ type: '-html-p' }).set({ type: 'paragraph' });
  doc.where({ type: '-html-br' }).set({ type: 'line-break' });
  doc.where({ type: '-html-hr' }).set({ type: 'horizontal-rule' });

  doc.where({ type: '-html-ul' }).set({ type: 'list', attributes: { type: 'bulleted' } });
  doc.where({ type: '-html-ol' }).update((list: OrderedList) => {
    doc.replaceAnnotation(list, {
      id: list.id,
      type: 'list',
      start: list.start,
      end: list.end,
      attributes: {
        type: 'numbered',
        startsAt: parseInt(list.attributes.starts, 10)
      }
    });
  });
  doc.where({ type: '-html-li' }).set({ type: 'list-item' });

  doc.where({ type: '-html-em' }).set({ type: 'italic' });
  doc.where({ type: '-html-i' }).set({ type: 'italic' });
  doc.where({ type: '-html-strong' }).set({ type: 'bold' });
  doc.where({ type: '-html-b' }).set({ type: 'bold' });

  doc.where({ type: '-html-img' }).set({ type: 'image' }).rename({ attributes: { src: 'url', alt: 'description' } });
}
