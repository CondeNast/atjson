import Document from '@atjson/document';
import OffsetSource from '@atjson/offset-annotations';
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

    doc.where({ type: '-gdocs-ts_bd' }).set({ type: '-offset-bold' });
    doc.where({ type: '-gdocs-ts_it' }).set({ type: '-offset-italic' });
    doc.where({ type: '-gdocs-ts_un' }).set({ type: '-offset-underline' });
    doc.where({ type: '-gdocs-ts_st' }).set({ type: '-offset-strikethrough' });
    doc.where({ type: '-gdocs-ts_va', attributes: { '-gdocs-va': 'sub' } }).set({ type: '-offset-subscript' }).unset('attributes.-gdocs-va');
    doc.where({ type: '-gdocs-ts_va', attributes: { '-gdocs-va': 'sup' } }).set({ type: '-offset-superscript' }).unset('attributes.-gdocs-va');

    doc.where({ type: '-gdocs-horizontal_rule' }).set({ type: '-offset-horizontal-rule' });

    doc.where({ type: '-gdocs-ps_hd' })
      .set({ type: '-offset-heading' })
      .rename({ attributes: { '-gdocs-level': '-offset-level' } });

    // b_gt: 9 indicates an unordered list, but ordered lists have a variety of b_gt values
    doc.where({ type: '-gdocs-list', attributes: { '-gdocs-ls_b_gt': 9 } }).set({ type: '-offset-list', attributes: { '-offset-type': 'bulleted' } });
    doc.where({ type: '-gdocs-list' }).set({ type: '-offset-list', attributes: { '-offset-type': 'numbered' } });
    doc.where({ type: '-gdocs-list_item' }).set({ type: '-offset-list-item' });

    doc.where({ type: '-gdocs-lnks_link' })
      .set({ type: '-offset-link' })
      .rename({ attributes: { '-gdocs-ulnk_url': '-offset-url' } });

    return new OffsetSource(doc.toJSON());
  }
}
