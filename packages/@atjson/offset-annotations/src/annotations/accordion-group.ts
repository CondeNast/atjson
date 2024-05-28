import { BlockAnnotation } from "@atjson/document";
/**
 * An Accordion contains a collection of accordion items that
 * are arranged vertically.
 * Each accordion item contains a header and a panel
 * The header contains the title of the content in the panel
 * The panel could contain text, pictures, embeds, videos
 *
 */
export class AccordionGroup extends BlockAnnotation<{
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
  static type = "accordion-group";
  static vendorPrefix = "offset";
}
