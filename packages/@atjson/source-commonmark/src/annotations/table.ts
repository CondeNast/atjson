import { BlockAnnotation } from "@atjson/document";

/**
 * Tables are not allowed in the strict commonmark specification. However:
 *   1) they are a common extension to include in markdown implementations
 * and
 *   2) converting from the html-like structure produced by parsing a
 *      markdown string into the appropriate offset annotations (a DataSet and
 *      Table pair) is non-trivial
 * so they are implemented here for convenience.
 */
export class Table extends BlockAnnotation {
  static type = "table";
  static vendorPrefix = "commonmark";
}
