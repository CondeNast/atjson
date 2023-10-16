import { BlockAnnotation } from "@atjson/document";

export class CneTicketingWidgetEmbed extends BlockAnnotation<{
  urlLoggedOut: string;
  width?: string;
  height?: string;
  /**
   * Refers to a slice instead of being an
   * embedded document.
   */
  caption?: string;
  sandbox?: string;
  /**
   * A named identifier used to quickly jump to this item
   */
  anchorName?: string;
  urlLoggedIn?: string;
  privacy?: "true" | "false";
}> {
  static vendorPrefix = "offset";
  static type = "cneticketingwidget-embed";
}
