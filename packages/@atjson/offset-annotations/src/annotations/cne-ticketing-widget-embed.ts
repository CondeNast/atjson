import { BlockAnnotation } from "@atjson/document";

export class CneTicketingWidgetEmbed extends BlockAnnotation<{
  url: string;
}> {
  static vendorPrefix = "offset";
  static type = "cne-ticketing-widget-embed";
}
