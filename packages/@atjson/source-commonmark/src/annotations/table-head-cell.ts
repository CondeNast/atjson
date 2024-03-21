import { BlockAnnotation } from "@atjson/document";

/**
 * a table with column text-alignment defined
 *  eg.
 *  | heading 1    | heading 2 |
 *  |:------------ |:---------:|
 *  | left-aligned | centered  |
 *
 * will produce th (and td) cells
 * with { style: "text-align:<left|right|center>" }
 *
 * https://github.github.com/gfm/#example-199
 */
export class TableHeadCell extends BlockAnnotation<{ style?: string }> {
  static type = "th";
  static vendorPrefix = "commonmark";
}
