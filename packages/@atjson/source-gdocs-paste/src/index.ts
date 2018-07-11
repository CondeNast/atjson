import Document, { Schema } from '@atjson/document';
import schema from '@atjson/schema';
import gdocsSchema from './schema';

import GDocsParser, { GDocsSource } from './gdocs-parser';

export default class extends Document {
  constructor(gdocsSource: GDocsSource) {
    let gdocsParser = new GDocsParser(gdocsSource);

    super({
      content: gdocsParser.getContent(),
      contentType: 'text/google-docs',
      annotations: gdocsParser.getAnnotations(),
      schema: gdocsSchema as Schema
    });
  }

  toCommonSchema(): Document {
    let doc = new Document({
      content: this.content,
      contentType: 'text/atjson',
      annotations: [...this.annotations],
      schema: schema as Schema
    });

    doc.where({ type: '-gdocs-ts_bd' }).set({ type: 'bold' });
    doc.where({ type: '-gdocs-ts_it' }).set({ type: 'italic' });
    doc.where({ type: '-gdocs-ts_un' }).set({ type: 'underline' });
    doc.where({ type: '-gdocs-ts_st' }).set({ type: 'strikethrough' });
    doc.where({ type: '-gdocs-ts_va', attributes: { '-gdocs-va': 'sub' } }).set({ type: 'subscript' }).unset('attributes.-gdocs-va');
    doc.where({ type: '-gdocs-ts_va', attributes: { '-gdocs-va': 'sup' } }).set({ type: 'superscript' }).unset('attributes.-gdocs-va');

    doc.where({ type: '-gdocs-horizontal_rule' }).set({ type: 'horizontal-rule' });

    doc.where({ type: '-gdocs-ps_hd' })
      .set({ type: 'heading' })
      .map({ attributes: { '-gdocs-level': 'level' } });

    // FIXME list conversion is incomplete, needs fixing.
    doc.where({ type: '-gdocs-list' }).set({ type: 'list', attributes: { type: 'numbered' } });
    doc.where({ type: '-gdocs-list-item' }).set({ type: 'list-item' });

    doc.where({ type: '-gdocs-lnks_link' })
      .set({ type: 'link' })
      .map({ attributes: { '-gdocs-ulnk_url': 'url' } });

    return doc;
  }
}
