import { BlockAnnotation } from "@atjson/document";
import { TextAlignment } from "../utils/enums";

export class Paragraph<
  T = {
    /**
     * A list of decorations to apply to the paragraph.
     * This may be something like a drop cap or other
     * decorative flourish.
     */
    decorations?: string[];

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
  }
> extends BlockAnnotation<T> {
  static type = "paragraph";
  static vendorPrefix = "offset";

  get rank() {
    return (super.rank * 3) / 2;
  }
}
