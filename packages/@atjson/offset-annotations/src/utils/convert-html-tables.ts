import {
  JSON,
  SliceAnnotation,
  compareAnnotations,
  Annotation,
  TextAnnotation,
  ParseAnnotation,
  AdjacentBoundaryBehaviour,
} from "@atjson/document";

import OffsetSource, { DataSet, Table, ColumnType } from "../index";

function extractPlainContents(
  doc: OffsetSource,
  annotation: { start: number; end: number }
): string {
  let contentSlice = doc.slice(annotation.start, annotation.end);
  let parseTokens = Array.from(
    contentSlice.where({ type: "-atjson-parse-token" })
  );
  contentSlice.deleteTextRanges(parseTokens);

  return contentSlice.content.trim();
}

function isInvalidTable(doc: OffsetSource, table: Table, vendor: string) {
  let headSections = doc.where(
    (annotation) =>
      annotation.vendorPrefix === vendor &&
      annotation.type === "thead" &&
      annotation.start >= table.start &&
      annotation.end <= table.end
  );

  if (headSections.length === 0) {
    /**
     * Currently, all invalid states come from weirdly-shaped head sections
     * so if there's no head section it's valid by default
     */
    return false;
  }

  if (headSections.length > 1) {
    /**
     * If there's more than one head section we don't know how to construct a dataset from this table
     */
    return true;
  }

  let thead = headSections.annotations[0];

  let headRows = doc.where(
    (annotation) =>
      annotation.vendorPrefix === vendor &&
      annotation.type === "tr" &&
      annotation.start >= thead.start &&
      annotation.end <= thead.end
  );

  if (headRows.length > 1) {
    /**
     * If there are multiple rows of column headings it's unclear which ones should
     * be the columns on the dataset
     */
    return true;
  }

  return false;
}

function extractAlignment(tableCell: Annotation<{ style: string }>) {
  if (tableCell.attributes.style) {
    let match = tableCell.attributes.style.match(
      /(text-align: ?(?<alignment>left|right|center))/
    );

    if (match?.groups?.alignment) {
      return match.groups.alignment as "left" | "right" | "center";
    }
  }

  return undefined;
}

export function convertHTMLTablesToDataSet(
  doc: OffsetSource,
  vendor: string
): void {
  doc.where({ type: `-${vendor}-table` }).forEach((table) => {
    if (isInvalidTable(doc, table, vendor)) {
      return;
    }

    let dataSetSchemaEntries: [name: string, type: ColumnType][] = [];
    let columnConfigs: Exclude<Table["attributes"]["columns"], undefined> = [];
    let dataRows: Record<string, { slice: string; jsonValue: JSON }>[] = [];
    let hasColumnHeaders = true;

    let slices: SliceAnnotation[] = [];

    let headings = doc.where(
      (annotation) =>
        annotation.vendorPrefix === vendor &&
        annotation.type === "th" &&
        annotation.start >= table.start &&
        annotation.end <= table.end
    );

    if (headings.length) {
      headings.sort(compareAnnotations).forEach((headCell, index) => {
        doc.addAnnotations(
          new TextAnnotation({
            start: headCell.start,
            end: headCell.end,
          })
        );

        let slice = new SliceAnnotation({
          ...headCell,
          id: undefined,
          attributes: { refs: [] },
        });
        doc.replaceAnnotation(headCell, slice);
        let columnName = extractPlainContents(doc, slice);

        dataSetSchemaEntries.push([
          columnName.length ? columnName : `column ${index + 1}`,
          ColumnType.RICH_TEXT,
        ]);

        slices.push(slice);

        let columnConfig: (typeof columnConfigs)[number] = {
          name: columnName,
          slice: slice.id,
        };

        let alignment = extractAlignment(headCell);
        if (alignment) {
          columnConfig.textAlign = alignment;
        }

        columnConfigs.push(columnConfig);
      });
    } else {
      hasColumnHeaders = false;
    }

    let tableRows = doc.where(
      (annotation) =>
        annotation.vendorPrefix === vendor &&
        annotation.type === "tr" &&
        annotation.start >= table.start &&
        annotation.end <= table.end
    );

    tableRows.forEach((row) => {
      let rowEntries: [string, { slice: string; jsonValue: JSON }][] = [];
      doc
        .where(
          (annotation) =>
            annotation.vendorPrefix === vendor &&
            annotation.type === "td" &&
            annotation.start >= row.start &&
            annotation.end <= row.end
        )
        .sort(compareAnnotations)
        .forEach((bodyCell, index) => {
          if (index !== 0) {
            doc.addAnnotations(
              new TextAnnotation({
                start: bodyCell.start,
                end: bodyCell.end,
              })
            );
          }

          if (!hasColumnHeaders) {
            let columnName = `column ${index + 1}`;

            let columnConfig: (typeof columnConfigs)[number] = {
              name: columnName,
            };

            let alignment = extractAlignment(bodyCell);
            if (alignment) {
              columnConfig.textAlign = alignment;
            }

            columnConfigs[index] = columnConfig;
            dataSetSchemaEntries[index] = [columnName, ColumnType.RICH_TEXT];
          }

          let slice = new SliceAnnotation({
            ...bodyCell,
            id: undefined,
            attributes: { refs: [] },
          });
          doc.replaceAnnotation(bodyCell, slice);
          rowEntries.push([
            dataSetSchemaEntries[index][0],
            {
              slice: slice.id,
              jsonValue: extractPlainContents(doc, slice),
            },
          ]);
          slices.push(slice);
        });

      if (rowEntries.length) {
        dataRows.push(Object.fromEntries(rowEntries));
      }
    });

    tableRows.remove();

    let dataSet = new DataSet({
      start: table.start,
      end: table.end,
      attributes: {
        schema: Object.fromEntries(dataSetSchemaEntries),
        records: dataRows,
      },
    });

    let offsetTable = new Table({
      ...table,
      id: undefined,
      attributes: {
        dataSet: dataSet.id,
        columns: columnConfigs,
        showColumnHeaders: hasColumnHeaders,
      },
    });

    slices.forEach((slice) => slice.attributes.refs.push(dataSet.id));

    doc.replaceAnnotation(table, dataSet, offsetTable);
  });

  doc.where({ type: `-${vendor}-thead` }).remove();
  doc.where({ type: `-${vendor}-tbody` }).remove();
}
