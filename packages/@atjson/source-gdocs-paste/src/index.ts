import Document from '@atjson/document';
import {
  Bold,
  Heading,
  HorizontalRule,
  Italic,
  Link,
  List,
  ListItem,
  Strikethrough,
  Underline,
  VerticalAdjust
} from './annotations';

import GDocsParser, { GDocsPasteBuffer } from './gdocs-parser';

export default class extends Document {
  static contentType = 'application/vnd.atjson+gdocs';
  static schema = [Bold, Heading, HorizontalRule, Italic, Link, List, ListItem, Strikethrough, Underline, VerticalAdjust];
  static fromSource(pasteBuffer: GDocsPasteBuffer) {
    let gdocsParser = new GDocsParser(pasteBuffer);

    return new this({
      content: gdocsParser.getContent(),
      annotations: gdocsParser.getAnnotations()
    });
  }

  toCommonSchema(): Document {
    let doc = this.clone();

    doc.where({ type: '-gdocs-ts_bd' }).set({ type: 'bold' });
    doc.where({ type: '-gdocs-ts_it' }).set({ type: 'italic' });
    doc.where({ type: '-gdocs-ts_un' }).set({ type: 'underline' });
    doc.where({ type: '-gdocs-ts_st' }).set({ type: 'strikethrough' });
    doc.where({ type: '-gdocs-ts_va', attributes: { '-gdocs-va': 'sub' } }).set({ type: 'subscript' }).unset('attributes.-gdocs-va');
    doc.where({ type: '-gdocs-ts_va', attributes: { '-gdocs-va': 'sup' } }).set({ type: 'superscript' }).unset('attributes.-gdocs-va');

    doc.where({ type: '-gdocs-horizontal_rule' }).set({ type: 'horizontal-rule' });

    doc.where({ type: '-gdocs-ps_hd' })
      .set({ type: 'heading' })
      .rename({ attributes: { '-gdocs-level': 'level' } });

    // b_gt: 9 indicates an unordered list, but ordered lists have a variety of b_gt values
    doc.where({ type: '-gdocs-list', attributes: { '-gdocs-ls_b_gt': 9 } }).set({ type: 'list', attributes: { type: 'bulleted' } });
    doc.where({ type: '-gdocs-list' }).set({ type: 'list', attributes: { type: 'numbered' } });
    doc.where({ type: '-gdocs-list_item' }).set({ type: 'list-item' });

    doc.where({ type: '-gdocs-lnks_link' })
      .set({ type: 'link' })
      .rename({ attributes: { '-gdocs-ulnk_url': 'url' } });

    return doc;
  }
}
