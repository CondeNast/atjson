import { BlockAnnotation } from "@atjson/document";

export class Heading extends BlockAnnotation<{
  level: 1 | 2 | 3 | 4 | 5 | 6 | 100 | 101;
}> {
  static vendorPrefix = "gdocs";
  /**
   * Paragraph style: heading
   */
  static type = "ps_hd" as const;
}
