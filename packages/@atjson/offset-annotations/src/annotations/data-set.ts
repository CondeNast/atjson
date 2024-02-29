import { BlockAnnotation, JSON } from "@atjson/document";

export enum ColumnType {
  PERITEXT = "peritext",
}

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
   * A human-readable way to identify the dataset
   */
  name?: string;

  /**
   * An ordered list of column definitions where:
   * `name` is a unique, human-readable string
   * `slice` is an id referring to a slice of the document
   *   containing the formatted column header text
   * `type` indicates how the `jsonValue` of corresponding
   *   fields in the `rows` array should be interpreted
   */
  schema: Record<string, ColumnType>;

  /**
   * An ordered list of records, using the column
   * `name`s as the keys. The values are objects referring to
   * the contents of the cell with a slice id alongside a serialized
   * representation of the cell in `jsonValue`
   */
  records: Record<string, { slice: string; jsonValue: JSON }>[];
}> {
  static vendorPrefix = "offset";
  static type = "data-set";
}
