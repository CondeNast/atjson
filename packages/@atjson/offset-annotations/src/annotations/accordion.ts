import { BlockAnnotation } from "@atjson/document";

export class Accordion extends BlockAnnotation<{
  /**
   * Each accordion has an array of accordion items, where each item
   * has the slice ID for the header and the sliceID for the panel
   * Each item can also optionally have an `anchorName` and an `opened` flag
   * to describe its initial state.
   * WAI ARIA - https://www.w3.org/WAI/ARIA/apg/patterns/accordion/examples/accordion/
   */
  items: {
    header: string;
    panel: string;
    anchorName?: string;
    opened?: boolean;
  }[];
  /**
   * A named identifier used to quickly jump to this item
   */
  anchorName?: string;
  /**
   * Layout information, used to indicate mutually
   * exclusive layouts, for example sizes, floats, etc.
   */
  layout?: string;
}> {
  static type = "accordion";
  static vendorPrefix = "offset";
}
