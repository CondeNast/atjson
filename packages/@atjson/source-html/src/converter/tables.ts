import OffsetSource, { Table, DataSet } from "@atjson/offset-annotations";
import { SliceAnnotation, compareAnnotations } from "@atjson/document";

export function convertTables(doc: OffsetSource): void {
  doc.where({ type: "-html-table" }).forEach((table) => {
    let dataColumnHeaders: string[] = [];
    let dataRows: Record<string, string>[] = [];

    doc
      .where(
        (annotation) =>
          annotation.type === "th" &&
          annotation.start >= table.start &&
          annotation.end <= table.end
      )
      .sort(compareAnnotations)
      .forEach((headCell) => {
        let slice = new SliceAnnotation({ ...headCell, id: undefined });
        doc.replaceAnnotation(headCell, slice);
        dataColumnHeaders.push(slice.id);
      });

    let tableRows = doc.where(
      (annotation) =>
        annotation.type === "tr" &&
        annotation.start >= table.start &&
        annotation.end <= table.end
    );

    tableRows.forEach((row) => {
      let rowEntries: [string, string][] = [];
      doc
        .where(
          (annotation) =>
            annotation.type === "td" &&
            annotation.start >= row.start &&
            annotation.end <= row.end
        )
        .sort(compareAnnotations)
        .forEach((bodyCell, index) => {
          let slice = new SliceAnnotation({ ...bodyCell, id: undefined });
          doc.replaceAnnotation(bodyCell, slice);
          rowEntries.push([dataColumnHeaders[index], slice.id]);
        });

      dataRows.push(Object.fromEntries(rowEntries));
    });

    tableRows.remove();

    let dataSet = new DataSet({
      ...table,
      id: undefined,
      attributes: { columnHeaders: dataColumnHeaders, rows: dataRows },
    });

    let dataSetSlice = new SliceAnnotation({
      ...dataSet,
      id: undefined,
      attributes: { refs: [] },
    });

    let offsetTable = new Table({
      ...table,
      id: undefined,
      attributes: { dataSet: dataSetSlice.id },
    });

    dataSetSlice.attributes.refs.push(offsetTable.id);

    doc.replaceAnnotation(table, dataSet, dataSetSlice, offsetTable);
  });

  doc.where({ type: "-html-thead" }).remove();
  doc.where({ type: "-html-tbody" }).remove();
}
