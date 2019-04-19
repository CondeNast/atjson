import { Annotation, BlockAnnotation, ParseAnnotation } from '@atjson/document';
import OffsetSource, { LineBreak, Paragraph } from '@atjson/offset-annotations';
import { Heading } from './annotations';
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

  // Remove headings with level 100, 101, as these are Titles/Subtitles
  // in GDocs which is not yet supported, as these should be thought of
  // as non-body annotations
  doc.where({ type: '-gdocs-ps_hd' })
    .where((annotation: Heading) => annotation.attributes.level >= 100)
    .remove();

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

  doc.where({ type: '-offset-list' }).as('list').join(
    doc.where({ type: '-offset-list-item' }).as('listItems'),
    (l, r) => l.start === r.start && l.end === r.end
  ).update(({ list, listItems }) => {
    let item = listItems[0];
    let insertionPoint = list.end;
    doc.insertText(insertionPoint, '\uFFFC');
    doc.addAnnotations(new ParseAnnotation({
      start: insertionPoint,
      end: insertionPoint + 1,
      attributes: {
        reason: 'object replacement character for single-item list'
      }
    }));
    item.end--;
  });

  // Replace vertical tabs with newlines
  doc.content = doc.content.replace(/\u000B/g, '\n');

  // Convert newlines to LineBreaks and Paragraphs. Paragraphs must not cross the boundary of a BlockAnnotation,
  // so divide the document into 'block boundaries' and then look for single/multiple new lines within each
  // block boundary
  let blockBoundaries = doc.where( (annotation: Annotation) => annotation instanceof BlockAnnotation )
    .reduce( (boundaries: Set<number>, annotation: Annotation) => {
      boundaries.add(annotation.start);
      boundaries.add(annotation.end);
      return boundaries;
    }, new Set([0, doc.content.length]));

  [...blockBoundaries]
    .sort( (boundary1, boundary2) => boundary1 - boundary2 )
    .slice(1)
    .map( (_, index, array) => {
      return {
        start: array[index - 1] || 0,
        end: array[index]
      };
    })
    .forEach( ({ start, end }) => {
      // Convert single new lines to LineBreaks
      doc.match(/(^|[^\n])\n([^\n]|$)/g, start, end).forEach(match => {
        let newlineStart = match.start + match.matches[1].length;
        let newlineEnd = match.end - match.matches[2].length;
        doc.addAnnotations(new LineBreak({
          start: newlineStart,
          end: newlineEnd
        }), new ParseAnnotation({
          start: newlineStart,
          end: newlineEnd,
          attributes: {
            reason: 'new line'
          }
        }));
      });

      // Multiple newlines indicate paragraph boundaries within the block boundary
      let lastEnd = start;
      doc.match(/\n{2,}/g, start, end).forEach( (match: { start: number, end: number }) => {
        doc.addAnnotations(new ParseAnnotation({
          start: match.start,
          end: match.end,
          attributes: {
            reason: 'multiple new lines to paragraph'
          }
        }));

        if (lastEnd <  match.start) {
          doc.addAnnotations(new Paragraph({
            start: lastEnd,
            end: match.start
          }));
        }
        lastEnd = match.end;
      });

      if (start < lastEnd && lastEnd < end) {
        doc.addAnnotations(new Paragraph({
          start: lastEnd,
          end
        }));
      }
    });

  // LineBreaks/paragraphs may have been created for listItem separators,
  // so delete those which exist in a list (or immediately after) but not in any list item
  doc.where((annotation: Annotation) => (annotation instanceof LineBreak) || (annotation instanceof Paragraph))
    .as('lineBreak')
    .join(
      doc.where({ type: '-offset-list' }).as('lists'),
      (l: Annotation, r: Annotation) => l.start >= r.start && l.end <= r.end + 1)
    .outerJoin(
      doc.where({type: '-offset-list-item'}).as('listItems'),
      (l: {lineBreak: LineBreak, lists: Array<Annotation<any>> }, r: Annotation<any>) => {
        return l.lineBreak.start >= r.start && l.lineBreak.end <= r.end;
      })
    .update(({lineBreak, listItems}) => {
      if (listItems.length === 0) {
        doc.removeAnnotation(lineBreak);
      }
    });

  // LineBreaks may have been created at a block boundary co-terminating
  // with a paragraph, so delete those which match a paragraph end
  doc.where(annotation => annotation instanceof LineBreak)
  .as('lineBreak')
  .join(
    doc.where(annotation => annotation instanceof Paragraph).as('paragraphs'),
    (l: Annotation, r: Annotation) => l.end === r.end)
  .update(({lineBreak}) => {
    doc.removeAnnotation(lineBreak);
  });

  return doc;
});
