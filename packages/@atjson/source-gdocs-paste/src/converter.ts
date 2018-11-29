import OffsetSource from '@atjson/offset-annotations';
import GDocsSource from './source';

GDocsSource.defineConverterTo(OffsetSource, doc => {
  // Remove all underlines that align with links, since
  // Google docs automatically does this when creating a link.
  // If necessary, underlined text can be added afterwards;
  // using this behavior ends up with unexpected consequences
  doc.where({ type: '-gdocs-ts_un' }).as('underline').join(
    doc.where({ type: '-gdocs-lnks_link' }).as('link'),
    (underline, link) => underline.isAlignedWith(link)
  ).update(({ underline }) => {
    doc.removeAnnotation(underline);
  });

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

  return doc;
});
