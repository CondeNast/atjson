import Document, {
  is,
  ParseAnnotation,
  SliceAnnotation,
  TextAnnotation,
} from "@atjson/document";
import uuid from "uuid-random";
import {
  Paragraph,
  DataSet,
  ColumnType,
  Table,
} from "@atjson/offset-annotations";

// eslint-disable-next-line no-control-regex
const TABLE = /\u0010(\u0012(\u001c.*\n)+)+\u0011/g;
// eslint-disable-next-line no-control-regex
const TABLE_ROW = /\u0012(\u001c.*\n)+/gmu;
// eslint-disable-next-line no-control-regex
const TABLE_CELL = /\u001c(.*)\n/gmu;

function snakecase(text: string) {
  return text.toLowerCase().replace(/\s+/, "_");
}

export function convertTables(doc: Document) {
  for (let table of doc.match(TABLE)) {
    let id = uuid();
    let rows: Array<Array<{ slice: string; jsonValue: string }>> = [];

    // Remove all paragraphs inside of tables
    doc
      .where(
        (a) => is(a, Paragraph) && a.start >= table.start && a.end <= table.end
      )
      .update((a) => {
        doc.replaceAnnotation(
          a,
          new TextAnnotation({
            start: a.start,
            end: a.end,
          })
        );
      });

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
          slice
        );
      }
      rows.push(row);
    }
    let [header, ...body] = rows;
    let columnNames = header.map(
      (header, index) => snakecase(header.jsonValue) + "__" + index
    );
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
      start: table.start,
      end: table.end,
      attributes: {
        schema,
        records,
      },
    });

    doc.addAnnotations(
      dataset,
      new ParseAnnotation({
        start: table.start,
        end: table.start + 1,
      }),
      new Table({
        start: table.start,
        end: table.end,
        attributes: {
          dataSet: dataset.id,
          showColumnHeaders: true,
          columns: header.map((cell, index) => {
            return {
              columnName: columnNames[index],
              slice: cell.slice,
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
}
