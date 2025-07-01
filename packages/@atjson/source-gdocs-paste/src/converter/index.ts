import {
  Annotation,
  BlockAnnotation,
  InlineAnnotation,
  ParseAnnotation,
  compareAnnotations,
  is,
} from "@atjson/document";
import OffsetSource, {
  Blockquote,
  Heading,
  LineBreak,
  ListItem,
  List,
  Paragraph,
  TextAlignment,
} from "@atjson/offset-annotations";
import GDocsSource from "../source";
import { Alignment, Heading as GDocsHeading } from "../annotations";
import { convertTables } from "./tables";
import { convertSmallCaps } from "./smallcaps";
import { convertDropCaps } from "./dropcaps";
import { IndentLeft } from "../annotations/indent-left";

// eslint-disable-next-line no-control-regex
const VERTICAL_TABS = /\u000B/g;
const NEWLINE_PARAGRAPH_SEPARATOR = /\n(\s*\n)*/g;

const ALIGNMENT = {
  0: undefined,
  1: TextAlignment.Center,
  2: TextAlignment.End,
  3: TextAlignment.Justify,
} as const;

GDocsSource.defineConverterTo(OffsetSource, (doc) => {
  // Remove all underlines that align with links, since
  // Google docs automatically does this when creating a link.
  // If necessary, underlined text can be added afterwards;
  // using this behavior ends up with unexpected consequences
  doc
    .where({ type: "-gdocs-ts_un" })
    .as("underline")
    .join(
      doc.where({ type: "-gdocs-lnks_link" }).as("link"),
      (underline, link) => underline.isAlignedWith(link)
    )
    .update(({ underline }) => {
      doc.removeAnnotation(underline);
    });

  doc.where({ type: "-gdocs-ts_bd" }).set({ type: "-offset-bold" });
  doc.where({ type: "-gdocs-ts_it" }).set({ type: "-offset-italic" });
  doc.where({ type: "-gdocs-ts_un" }).set({ type: "-offset-underline" });
  doc.where({ type: "-gdocs-ts_st" }).set({ type: "-offset-strikethrough" });
  doc.where({ type: "-gdocs-ts_sc" }).set({ type: "-offset-small-caps" });
  doc
    .where({ type: "-gdocs-ts_va", attributes: { "-gdocs-va": "sub" } })
    .set({ type: "-offset-subscript" })
    .unset("attributes.-gdocs-va");
  doc
    .where({ type: "-gdocs-ts_va", attributes: { "-gdocs-va": "sup" } })
    .set({ type: "-offset-superscript" })
    .unset("attributes.-gdocs-va");

  doc
    .where({ type: "-gdocs-horizontal_rule" })
    .set({ type: "-offset-horizontal-rule" });

  // Remove headings with level 100, 101, as these are Titles/Subtitles
  // in GDocs which is not yet supported, as these should be thought of
  // as non-body annotations
  doc.where({ type: "-gdocs-ps_hd" }).update((heading: GDocsHeading) => {
    let level = heading.attributes.level;
    if (level >= 100) {
      doc.removeAnnotation(heading);
    } else {
      doc.replaceAnnotation(
        heading,
        new Heading({
          id: heading.id,
          start: heading.start,
          end: heading.end,
          attributes: {
            level: level as 1 | 2 | 3 | 4 | 5 | 6,
            textAlignment: ALIGNMENT[heading.attributes.align],
          },
        })
      );
    }
  });

  // b_gt: 9 indicates an unordered list, but ordered lists have a variety of b_gt values
  doc
    .where({ type: "-gdocs-list", attributes: { "-gdocs-ls_b_gt": 9 } })
    .set({ type: "-offset-list", attributes: { "-offset-type": "bulleted" } });
  doc
    .where({ type: "-gdocs-list" })
    .set({ type: "-offset-list", attributes: { "-offset-type": "numbered" } });
  doc.where({ type: "-gdocs-list_item" }).set({ type: "-offset-list-item" });

  doc
    .where({ type: "-gdocs-lnks_link" })
    .set({ type: "-offset-link" })
    .rename({ attributes: { "-gdocs-ulnk_url": "-offset-url" } });

  let convertedLists = doc
    .where({ type: "-offset-list" })
    .as("list")
    .join(
      doc.where({ type: "-offset-list-item" }).as("listItems"),
      (list, listItem) =>
        list.start <= listItem.start && list.end >= listItem.end
    );

  convertedLists.update(({ list, listItems }) => {
    for (let newline of doc.match(
      NEWLINE_PARAGRAPH_SEPARATOR,
      list.start,
      list.end
    )) {
      let adjacentListItem = listItems.find(
        (listItem) => listItem.end === newline.start
      );
      if (adjacentListItem) {
        doc.addAnnotations(
          new ParseAnnotation({
            start: newline.start,
            end: newline.end,
            attributes: { reason: "list item separator" },
          })
        );
      }
    }
  });

  // Convert vertical tabs to line breaks
  for (let verticalTab of doc.match(VERTICAL_TABS)) {
    doc.addAnnotations(
      new LineBreak({
        start: verticalTab.start,
        end: verticalTab.end,
      }),
      new ParseAnnotation({
        start: verticalTab.start,
        end: verticalTab.end,
        attributes: {
          reason: "vertical tab",
        },
      })
    );
  }

  // Convert newlines to Paragraphs. Paragraphs must not cross the boundary of a BlockAnnotation, so
  // divide the document into 'block boundaries' and then look for single/multiple new lines within each
  // block boundary
  let blockBoundaries = doc
    .where((annotation: Annotation) => annotation instanceof BlockAnnotation)
    .reduce((boundaries: Set<number>, annotation: Annotation) => {
      boundaries.add(annotation.start);
      boundaries.add(annotation.end);
      return boundaries;
    }, new Set([0, doc.content.length]));

  [...blockBoundaries]
    .sort((boundary1, boundary2) => boundary1 - boundary2)
    .slice(1)
    .map((_, index, array) => {
      return {
        start: array[index - 1] || 0,
        end: array[index],
      };
    })
    .forEach(({ start, end }) => {
      // Multiple newlines indicate paragraph boundaries within the block boundary
      let paragraphBoundaries = doc.match(
        NEWLINE_PARAGRAPH_SEPARATOR,
        start,
        end
      );
      let lastEnd = start;
      for (let paragraphBoundary of paragraphBoundaries) {
        if (lastEnd < paragraphBoundary.start) {
          doc.addAnnotations(
            new Paragraph({
              start: lastEnd,
              end: paragraphBoundary.start,
            }),
            new ParseAnnotation({
              start: paragraphBoundary.start,
              end: paragraphBoundary.end,
              attributes: {
                reason: "paragraph boundary",
              },
            })
          );
        }
        lastEnd = paragraphBoundary.end;
      }

      // Close a remaining paragraph boundary at the block boundary
      if (start < lastEnd && lastEnd < end) {
        doc.addAnnotations(
          new Paragraph({
            start: lastEnd,
            end,
          })
        );
      }
    });

  doc.where({ type: "-gdocs-ps_al" }).update((align: Alignment) => {
    doc.replaceAnnotation(
      align,
      new Paragraph({
        start: align.start,
        end: align.end,
        attributes: {
          textAlignment: ALIGNMENT[align.attributes.align],
        },
      })
    );
  });

  // Interpreting paragraphs with a left indent as blockquotes
  doc.where({ type: "-gdocs-ps_il" }).update((bq) => {
    const text = doc.content.substring(bq.start, bq.end);
    const hasContent = bq.end > bq.start && text.trim().length > 0;

    console.log("ps_il annotation:", {
      start: bq.start,
      end: bq.end,
      length: bq.end - bq.start,
      text: text,
      indent: bq.attributes.indent,
      hasContent: hasContent,
    });

    // Only convert to blockquote if it has actual content
    if (hasContent) {
      doc.replaceAnnotation(
        bq,
        new Blockquote({
          start: bq.start,
          end: bq.end,
        })
      );
    } else {
      doc.removeAnnotation(bq);
    }
  });
  // GDocs can produce lists that have paragraphs in them that are
  // not wrapped by a list item. In these cases, split the list before
  // and after the paragraph, as necessary
  convertedLists
    .join(
      doc.where({ type: "-offset-paragraph" }).as("paragraphs"),
      ({ list }, paragraph) =>
        list.start <= paragraph.start && paragraph.end <= list.end
    )
    .update(({ list, listItems, paragraphs }) => {
      let blocks: Array<Paragraph | ListItem> = [...listItems, ...paragraphs];

      // Sort list items and paragraphs topologically so we can determine their
      // nested structure
      blocks.sort(compareAnnotations);

      let lastListItem = null;
      let currentList = list;
      let listEnd = list.end;
      for (let block of blocks) {
        // We have a list item, so mark it as the last seen.
        if (is(block, ListItem)) {
          lastListItem = block;

          // if the list was previously split, wrap the remainder in a new
          // list annotation. We only have to do this in this case when we've
          // found more list items that now lie outside the current list
          if (currentList.end < block.end) {
            currentList = new List({
              ...currentList,
              start: block.start,
              end: listEnd,
            });
            doc.addAnnotations(currentList);
          }
          continue;
        }

        // In this case we have a paragraph that is wrapped in a list item
        // We can just continue
        if (lastListItem && lastListItem.end >= block.end) {
          continue;
        }

        // We've found a paragraph with no wrapping list item. If the current
        // list overlaps this paragraph, truncate it to the beginning of the
        // of the paragraph.
        if (currentList.end > block.start) {
          currentList.end = block.start;
        }
      }
    });

  // Resolve single-item lists. New ones may have been created by splitting
  // lists
  doc
    .where({ type: "-offset-list" })
    .as("list")
    .join(
      doc.where({ type: "-offset-list-item" }).as("listItems"),
      (list, listItem) =>
        list.start === listItem.start && list.end === listItem.end
    )
    .update(({ list, listItems }) => {
      let insertionPoint = list.end;
      let item = listItems[0];
      doc.insertText(insertionPoint, "\uFFFC");
      doc.addAnnotations(
        new ParseAnnotation({
          start: insertionPoint,
          end: insertionPoint + 1,
          attributes: {
            reason: "object replacement character for single-item list",
          },
        })
      );
      item.end--;
    });

  convertTables(doc);

  // use font sizes to detect small caps and drop caps
  convertSmallCaps(doc);
  convertDropCaps(doc);

  // clean up font size annotations
  doc.where({ type: "-gdocs-ts_fs" }).remove();

  // adjust marks to not cover whitespace at the start / end positions
  doc
    .where((a) => a instanceof InlineAnnotation)
    .update((mark) => {
      let start = mark.start;
      let end = mark.end;
      while (
        start < end &&
        doc.content[start] &&
        doc.content[start].match(/\s/)
      ) {
        start++;
      }

      while (
        end > start &&
        doc.content[end - 1] &&
        doc.content[end - 1].match(/\s/)
      ) {
        end--;
      }

      mark.start = start;
      mark.end = end;
    });

  return doc;
});
