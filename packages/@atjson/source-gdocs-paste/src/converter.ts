import {
  Annotation,
  BlockAnnotation,
  InlineAnnotation,
  ParseAnnotation,
  SliceAnnotation,
  compareAnnotations,
  is,
} from "@atjson/document";
import OffsetSource, {
  Heading,
  LineBreak,
  ListItem,
  List,
  Paragraph,
  DataSet,
  ColumnType,
  Table,
} from "@atjson/offset-annotations";
import GDocsSource from "./source";
import { Heading as GDocsHeading } from "./annotations";
import uuid from "uuid-random";

// eslint-disable-next-line no-control-regex
const VERTICAL_TABS = /\u000B/g;
const TABLE = /\u0010(\u0012(\u001c.*\n)+)+\u0011/g;
const TABLE_ROW = /\u0012(\u001c.*\n)+/gmu;
const TABLE_CELL = /\u001c(.*)\n/gmu;
const NEWLINE_PARAGRAPH_SEPARATOR = /\n(\s*\n)*/g;

const ALIGNMENT = {
  0: undefined,
  1: "center",
  2: "end",
  3: "justify",
} as const;

GDocsSource.defineConverterTo(OffsetSource, (doc) => {
  // Remove zero-length annotations
  // This is a bit of a workaround to deal with complications that arise when trying to
  // sort start/end tokens for these annotations when serializing the document
  // doc.where((a) => a.start === a.end).remove();

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
            alignment: ALIGNMENT[heading.attributes.align],
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

  // Convert vertical tabs to line breaks
  for (let table of doc.match(TABLE)) {
    let id = uuid();
    let rows: Array<Array<{ slice: string; jsonValue: string }>> = [];

    // Gather the dataset info first
    for (let tableRow of doc.match(TABLE_ROW, table.start, table.end)) {
      let row: Array<{ slice: string; jsonValue: string }> = [];
      doc.addAnnotations(
        new ParseAnnotation({
          start: tableRow.start,
          end: tableRow.start + 1,
        })
      );

      for (let tableCell of doc.match(
        TABLE_CELL,
        tableRow.start + 1,
        tableRow.end
      )) {
        let slice = new SliceAnnotation({
          start: tableCell.start,
          end: tableCell.end,
          attributes: {
            refs: [id],
          },
        });
        row.push({
          slice: slice.id,
          jsonValue: tableCell.matches[1],
        });
        doc.addAnnotations(
          new ParseAnnotation({
            start: tableCell.start,
            end: tableCell.start + 1,
          }),
          slice,
          new ParseAnnotation({
            start: tableCell.end - 1,
            end: tableCell.end,
          })
        );
      }
      rows.push(row);
    }
    let [header, ...body] = rows;
    let columnNames = header.map((header) => header.jsonValue);
    let records = body.map((row) => {
      return row.reduce((E, cell, index) => {
        E[columnNames[index]] = cell;
        return E;
      }, {} as Record<string, { slice: string; jsonValue: string }>);
    });
    let schema = columnNames.reduce((E, columnName) => {
      E[columnName] = ColumnType.RICH_TEXT;
      return E;
    }, {} as Record<string, ColumnType>);

    let dataset = new DataSet({
      id,
      start: table.start + 1,
      end: table.end + 1,
      attributes: {
        schema,
        records,
      },
    });
    doc.addAnnotations(dataset);
    doc.addAnnotations(
      new ParseAnnotation({
        start: table.start,
        end: table.start + 1,
      }),
      new Table({
        start: table.end - 1,
        end: table.end,
        attributes: {
          dataSet: dataset.id,
          columns: columnNames.map((columnName, index) => {
            return {
              name: columnName,
              slice: header[index].slice,
            };
          }),
        },
      }),
      new ParseAnnotation({
        start: table.end - 1,
        end: table.end,
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

  doc.where({ type: "-gdocs-ps_al" }).update((align) => {
    let alignment: "start" | "center" | "end" | "justify" | undefined;
    switch (align.attributes.align) {
      case 0:
        alignment = "start";
        break;
      case 1:
        alignment = "center";
        break;
      case 2:
        alignment = "end";
        break;
      case 3:
        alignment = "justify";
        break;
    }
    doc.replaceAnnotation(
      align,
      new Paragraph({
        start: align.start,
        end: align.end,
        attributes: {
          alignment,
        },
      })
    );
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
