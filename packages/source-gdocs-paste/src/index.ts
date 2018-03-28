import Document from '@atjson/document';
import schema from '@atjson/schema';
import gdocsSchema from './schema';

import GDocsParser from './gdocs-parser';

export default class extends Document {
  constructor(gdocsSource: string) {

    let gdocsParser = new GDocsParser(gdocsSource);

    super({
      content: gdocsParser.getContent(),
      contentType: 'text/google-docs',
      annotations: gdocsParser.getAnnotations(),
      schema: gdocsSchema
    });
  }

  toCommonSchema(): Document {
    let doc = new Document({
      content: this.content,
      contentType: 'text/atjson',
      annotations: [...this.annotations],
      schema
    });

    doc.where({ type: '-gdocs-ts_bd' }).set({ type: 'bold' });
    doc.where({ type: '-gdocs-ts_it' }).set({ type: 'italic' });

    doc.where({ type: '-gdocs-ps_hd' })
      .set({ type: 'heading' })
      .map({ attributes: { '-gdocs-level': 'level' } });

    // FIXME list conversion is incomplete, needs fixing.
    doc.where({ type: '-gdocs-list' }).set(
      { type: 'list' },
      { attributes: { type: 'numbered' } }
    );
    doc.where({ type: '-gdocs-list-item' }).set({ type: 'list-item' });

    doc.where({ type: '-gdocs-lnks_link' })
      .set({ type: 'link' })
      .map({ attributes: { '-gdocs-ulnk_url': 'url' } });

    return doc;
  }
}
