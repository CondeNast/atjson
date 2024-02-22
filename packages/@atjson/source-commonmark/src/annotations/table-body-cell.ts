import { BlockAnnotation } from "@atjson/document";

/**
 * a table with column text-alignment defined
 *  eg.
 *  | heading 1    | heading 2 |
 *  |:------------ |:---------:|
 *  | left-aligned | centered  |
 *
 * will produce td (and th) cells
 * with { style: "text-align:<left|right|center>" }
 *
 * https://github.github.com/gfm/#example-199
 */
export class TableBodyCell extends BlockAnnotation<{ style?: string }> {
  static type = "td";
  static vendorPrefix = "commonmark";
}
