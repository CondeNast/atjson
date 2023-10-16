// ⚠️ Generated via script; modifications may be overridden
import { ObjectAnnotation } from "@atjson/document";
import { GlobalAttributes } from "../global-attributes";

export class CneTicketingWidgetEmbed extends ObjectAnnotation<
  GlobalAttributes & {
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
  }
> {
  static vendorPrefix = "html";
  static type = "cne-ticketing-widget";
}
