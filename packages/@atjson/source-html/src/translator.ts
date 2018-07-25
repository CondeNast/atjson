import Document, { AnyAnnotation } from '../../document/dist/commonjs';

export default class HTMLSchemaTranslator extends Document {
  static schema = [];
  constructor(document: Document) {
    super(document.toJSON());

    this.where({ type: '-html-a' }).set({ type: 'link' }).rename({ attributes: { '-html-href': 'url' } });

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
      .rename({ attributes: { '-html-starts': 'startsAt' } }).map((list: AnyAnnotation) => {
        if (list.attributes && list.attributes.startsAt) {
          list.attributes.startsAt = parseInt(list.attributes.startsAt, 10);
        }
        return list;
      });
    this.where({ type: '-html-li' }).set({ type: 'list-item' });

    this.where({ type: '-html-em' }).set({ type: 'italic' });
    this.where({ type: '-html-i' }).set({ type: 'italic' });
    this.where({ type: '-html-strong' }).set({ type: 'bold' });
    this.where({ type: '-html-b' }).set({ type: 'bold' });

    this.where({ type: '-html-img' }).set({ type: 'image'}).rename({ attributes: { '-html-src': 'url', '-html-alt': 'description' } });
  }
}
