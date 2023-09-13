import { BlockAnnotation } from "@atjson/document";
import { TextAlignment } from "../utils/enums";

export class Blockquote extends BlockAnnotation<{
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
  static type = "blockquote";
  static vendorPrefix = "offset";
}
