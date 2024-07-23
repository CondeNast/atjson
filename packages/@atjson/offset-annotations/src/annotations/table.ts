import { BlockAnnotation } from "@atjson/document";
import { TextAlignment } from "../utils/enums";

/**
 * A table is a way of displaying tabular or database-like data.
 * Tables display data as an optional list of column headings followed
 * by an arbitrary number of rows of data, with each row having possibly-undefined
 * entries corresponding to each column.
 *
 * Offset Tables represent a presentation of the data in an offset DataSet. By
 * separating the display of the data from the data itself, tables may freely
 * reorder the underlying data, omit pieces of data, restrain the window
 * onto the data, etc.
 *
 * However, Markdown and HTML tables do not allow in general for this level of
 * separation between the data and presentation. Be aware that only
 * a subset of the tables which are representable in this format can be retrieved
 * from these and related rendering formats.
 */
export class Table extends BlockAnnotation<{
  /**
   * The id of the DataSet from which the table data comes
   */
  dataSet: string;

  /**
   * Configuration for the columns of the table. The `id` fields correspond
   * to the values in the columnHeaders field in the dataSet. The order of
   * the columns in this array can be used to reorder columns from the
   * original dataset, and excluding columns from this array will exclude
   * them from rendering.
   */
  columns: Array<{
    /**
     * `name` corresponds to the fields on the schema of the corresponding DataSet
     */
    name: string;

    /**
     * `plaintextName`, if present, is a stringified version of the displayed column header text
     */
    plaintextName?: string;

    /**
     * `slice` is a reference to the slice of the document to be rendered as the column header
     */
    slice?: string;

    /**
     * `textAlignment` is stored on the column level as a concession to the markdown table format
     */
    textAlignment?: TextAlignment;
  }>;

  /**
   * Tables may decide whether or not to display the column headers
   * on the underlying data.
   */
  showColumnHeaders?: boolean;
}> {
  static vendorPrefix = "offset";
  static type = "table";
}
