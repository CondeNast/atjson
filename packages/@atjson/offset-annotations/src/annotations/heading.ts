import { BlockAnnotation } from "@atjson/document";
import { TextAlignment } from "../utils/enums";

export class Heading extends BlockAnnotation<{
  /**
   * The heading level, from 1-6 as mapped to from
   * DOM headings. These should correspond with
   * accessiblity levels.
   */
  level: 1 | 2 | 3 | 4 | 5 | 6;

  /**
   * Layout information, used to indicate mutually
   * exclusive layouts, for example sizes, floats, etc.
   */
  layout?: string;

  /**
   * Text alignment of the block.
   */
  textAlignment?: TextAlignment;

  /**
   * A named identifier used to quickly jump to this item
   */
  anchorName?: string;
}> {
  static type = "heading";
  static vendorPrefix = "offset";
}
