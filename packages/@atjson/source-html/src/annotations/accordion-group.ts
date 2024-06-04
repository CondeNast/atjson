import { BlockAnnotation } from "@atjson/document";
import { GlobalAttributes } from "../global-attributes";

/**
 * An Accordion contains a collection of accordion items that
 * are arranged vertically.
 * Each accordion item contains a header and a panel
 * The header contains the title of the content in the panel
 * The panel could contain text, pictures, embeds, videos
 *
 */
export class AccordionGroup extends BlockAnnotation<GlobalAttributes> {
  static type = "accordion-group";
  static vendorPrefix = "offset";
}
