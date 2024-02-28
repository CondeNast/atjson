import {
  AdjacentBoundaryBehaviour,
  JSON,
  SliceAnnotation,
  compareAnnotations,
} from "@atjson/document";
import OffsetSource, {
  DataSet,
  Table,
  ColumnType,
} from "@atjson/offset-annotations";

export function convertTables(doc: OffsetSource): void {
  throw new Error("handle unsupported table structures gracefully");
  doc.where({ type: "-html-table" }).forEach((table) => {
    let dataColumnHeaders: {
      name: string;
      slice: string;
      type: ColumnType;
    }[] = [];
    let columnConfigs: Table["attributes"]["columns"] = [];
    let dataRows: Record<string, { slice: string; jsonValue: JSON }>[] = [];

    let slices: SliceAnnotation[] = [];

    doc
      .where(
        (annotation) =>
          annotation.type === "th" &&
          annotation.start >= table.start &&
          annotation.end <= table.end
      )
      .sort(compareAnnotations)
      .forEach((headCell, index) => {
        if (index !== 0) {
          doc.insertText(
            headCell.start,
            " ",
            AdjacentBoundaryBehaviour.preserveBoth
          );
        }

        let slice = new SliceAnnotation({
          ...headCell,
          id: undefined,
          attributes: { refs: [], retain: true },
        });
        doc.replaceAnnotation(headCell, slice);
        let columnName = doc.content.slice(slice.start, slice.end).trim();
        dataColumnHeaders.push({
          slice: slice.id,
          name: columnName.length ? columnName : `column ${index + 1}`,
          type: ColumnType.PERITEXT,
        });
        slices.push(slice);

        if (headCell.attributes.style) {
          let { groups }: RegExpMatchArray = headCell.attributes.style.match(
            /(text-align: ?(?<alignment>left|right|center))/
          );

          if (groups?.alignment) {
            columnConfigs?.push({
              name: columnName,
              textAlign: groups.alignment as "left" | "right" | "center",
            });
          }
        }
      });

    let tableRows = doc.where(
      (annotation) =>
        annotation.type === "tr" &&
        annotation.start >= table.start &&
        annotation.end <= table.end
    );

    tableRows.forEach((row) => {
      doc.insertText(row.start, " ", AdjacentBoundaryBehaviour.preserveBoth);

      let rowEntries: [string, { slice: string; jsonValue: JSON }][] = [];
      doc
        .where(
          (annotation) =>
            annotation.type === "td" &&
            annotation.start >= row.start &&
            annotation.end <= row.end
        )
        .sort(compareAnnotations)
        .forEach((bodyCell, index) => {
          if (index !== 0) {
            doc.insertText(
              bodyCell.start,
              " ",
              AdjacentBoundaryBehaviour.preserveBoth
            );
          }
          let slice = new SliceAnnotation({
            ...bodyCell,
            id: undefined,
            attributes: { refs: [], retain: true },
          });
          doc.replaceAnnotation(bodyCell, slice);
          rowEntries.push([
            dataColumnHeaders[index].name,
            {
              slice: slice.id,
              jsonValue: doc.content.slice(slice.start, slice.end),
            },
          ]);
          slices.push(slice);
        });

      dataRows.push(Object.fromEntries(rowEntries));
    });

    tableRows.remove();

    let dataSet = new DataSet({
      ...table,
      id: undefined,
      attributes: {
        columns: dataColumnHeaders,
        rows: dataRows,
      },
    });

    let dataSetSlice = new SliceAnnotation({
      ...dataSet,
      id: undefined,
      attributes: { refs: [], retain: true },
    });

    let offsetTable = new Table({
      ...table,
      id: undefined,
      attributes: { dataSet: dataSetSlice.id },
    });

    if (columnConfigs?.length) {
      offsetTable.attributes.columns = columnConfigs;
    }

    slices.forEach((slice) => slice.attributes.refs.push(dataSet.id));
    dataSetSlice.attributes.refs.push(offsetTable.id);

    doc.replaceAnnotation(table, dataSet, dataSetSlice, offsetTable);

    doc.insertText(
      offsetTable.end,
      "\uFFFC",
      AdjacentBoundaryBehaviour.preserveBoth
    );

    offsetTable.end += 1;
  });

  doc.where({ type: "-html-thead" }).remove();
  doc.where({ type: "-html-tbody" }).remove();
}
