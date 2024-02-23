import { BlockAnnotation } from "@atjson/document";

/**
 * A data set is an ordered collection of tabular
 * data that is stored within a document. The data set
 * can be used to display tables, graphs, and
 * generate content via templating.
 *
 * The data set refers to slices of content in the
 * document, which means that manipulation of this
 * data will be difficult by hand unless the slice
 * identifiers are human-friendly. We encourage
 * using a UI or a pipe to other tabular databases /
 * spreadsheets to fill in this data.
 */
export class DataSet extends BlockAnnotation<{
  /**
   * An ordered list of the column names,
   * referenced by slice ID.
   */
  columnHeaders: string[];

  /**
   * An ordered list of rows, using the column
   * slice IDs as the key and the value referring
   * to the cell value.
   */
  rows: Record<string, string>[];
}> {
  static vendorPrefix = "offset";
  static type = "data-set";

  withStableIds(ids: Map<string, string>) {
    let newAnnotation = super.withStableIds(ids);
    let newRows = newAnnotation.attributes.rows.map((row) => {
      let updatedEntries = Object.entries(row).map(([key, value]) => [
        ids.has(key) ? (ids.get(key) as string) : key,
        value,
      ]);

      return Object.fromEntries(updatedEntries);
    });

    newAnnotation.attributes.rows = newRows;

    return newAnnotation;
  }
}
