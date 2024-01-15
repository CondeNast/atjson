import { BlockAnnotation } from "@atjson/document";

export class CneEventRegistrationEmbed extends BlockAnnotation<{
  url: string;
}> {
  static vendorPrefix = "offset";
  static type = "cne-event-registration-embed";
}
