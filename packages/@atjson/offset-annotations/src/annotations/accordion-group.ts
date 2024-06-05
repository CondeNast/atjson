import { BlockAnnotation } from "@atjson/document";
/**
 * An Accordion group can hold multiple accordions. It has
 * the following attributes
 * layout: used to set accordion to full page width or half page width
 * anchorName: helps as hyperlinks on the web page
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
