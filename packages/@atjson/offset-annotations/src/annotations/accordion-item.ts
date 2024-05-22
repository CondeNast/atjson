import { BlockAnnotation } from "@atjson/document";

export class AccordionItem extends BlockAnnotation<{
  /**
   * A named identifier used to store the title of the
   * content in the panel
   */
  header: string;
  /**
   * A named identifier used to store the content
   */
  panel: string;
}> {
  static type = "accordion-item";
  static vendorPrefix = "offset";
}
