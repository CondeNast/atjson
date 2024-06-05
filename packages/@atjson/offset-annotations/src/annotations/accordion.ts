import { BlockAnnotation } from "@atjson/document";
/**
 *
 * Each accordion item contains the following attributes
 * header: contains the title of the content in the panel
 * panel: could contain text, pictures, embeds, videos
 * opened: determines whether the panel is hidden or shown
 * anchorName: helps as hyperlinks on the web page
 * Web Accessibility Initiative – Accessible Rich Internet Applications
 * WAI/ARIA
 * https://www.w3.org/WAI/ARIA/apg/patterns/accordion/examples/accordion/
 */
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
   * A named identifier used to quickly jump to this item
   */
  anchorName?: string;
}> {
  static type = "accordion";
  static vendorPrefix = "offset";
}
