import Document from '@atjson/document';
import schema from '@atjson/schema';

export default class HTMLSchemaTranslator extends Document {
  constructor(document: Document) {
    super({
      content: document.content,
      contentType: 'text/atjson',
      annotations: [...document.annotations],
      schema
    });

    this.where({ type: '-html-a' }).set({ type: 'link' }).rename({ attributes: { href: 'url' } });

    this.where({ type: '-html-blockquote' }).set({ type: 'blockquote' });

    this.where({ type: '-html-h1' }).set({ type: 'heading', attributes: { level: 1 } });
    this.where({ type: '-html-h2' }).set({ type: 'heading', attributes: { level: 2 } });
    this.where({ type: '-html-h3' }).set({ type: 'heading', attributes: { level: 3 } });
    this.where({ type: '-html-h4' }).set({ type: 'heading', attributes: { level: 4 } });
    this.where({ type: '-html-h5' }).set({ type: 'heading', attributes: { level: 5 } });
    this.where({ type: '-html-h6' }).set({ type: 'heading', attributes: { level: 6 } });

    this.where({ type: '-html-p' }).set({ type: 'paragraph' });
    this.where({ type: '-html-br' }).set({ type: 'line-break' });
    this.where({ type: '-html-hr' }).set({ type: 'horizontal-rule' });

    this.where({ type: '-html-ul' }).set({ type: 'list', attributes: { type: 'bulleted' } });
    this.where({ type: '-html-ol' }).set({ type: 'list', attributes: { type: 'numbered' } })
      .rename({ attributes: { starts: 'startsAt' } }).map(list => {
        if (list.attributes.startsAt) {
          list.attributes.startsAt = parseInt(list.attributes.startsAt, 10);
        }
        return list;
      });
    this.where({ type: '-html-li' }).set({ type: 'list-item' });

    this.where({ type: '-html-em' }).set({ type: 'italic' });
    this.where({ type: '-html-i' }).set({ type: 'italic' });
    this.where({ type: '-html-strong' }).set({ type: 'bold' });
    this.where({ type: '-html-b' }).set({ type: 'bold' });

    this.where({ type: '-html-img' }).set({ type: 'image'}).rename({ attributes: { src: 'url', alt: 'description' } });
  }
}
