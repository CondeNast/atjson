import { BlockAnnotation } from "@atjson/document";

export class Accordion extends BlockAnnotation<{
  /**
   * Slice referring to the header of the accordion,
   * which is initially visible.
   */
  header: string;
  /**
   * Slice referring to the panel content of the accordion.
   * This should be shown when the panel is in a default
   * opened state or it is opened by a user by tapping
   * the header.
   */
  panel?: string;
  /**
   * Initial state of this accordion.
   * (TBD what consumers initially should do.)
   */
  opened?: boolean;
  /**
   * A named identifier used to represent the layout
   * like full page width or half
   */
  layout?: string;
  /**
   * A named identifier used to quickly jump to this item
   */
  anchorName?: string;
}> {
  static type = "accordion";
  static vendorPrefix = "offset";
}
