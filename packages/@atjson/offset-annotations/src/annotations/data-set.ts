import { BlockAnnotation, JSON } from "@atjson/document";

/**
 * Information about how to interpret column values.
 * For instance, values like `1.4e3` or `2.50` are ambiguous
 * and should be handled differently by consuming code as
 * numbers, dollar amounts, and plain strings.
 */
export enum ColumnType {
  RICH_TEXT = "rich_text",
  STRING = "string",
  NUMBER = "number",
  CURRENCY = "currency",
  DATE = "date",
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
   * An mapping of column names to ColumnType enum values where:
   *  the key is a unique, human-readable string
   *  the value indicates how the `jsonValue` of corresponding
   *   fields in the `rows` array should be interpreted
   */
  schema: Record<string, ColumnType>;

  /**
   * An ordered list of records, using the column
   * `name`s as the keys. The values are objects referring to
   * the contents of the cell with a slice id alongside a serialized
   * representation of the cell in `jsonValue`
   */
  records: Record<string, { slice: string; jsonValue: JSON } | undefined>[];
}> {
  static vendorPrefix = "offset";
  static type = "data-set";
}
