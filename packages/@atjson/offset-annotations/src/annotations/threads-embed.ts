import { BlockAnnotation } from "@atjson/document";

export class ThreadsEmbed extends BlockAnnotation<{
  /**
   * The URL to the Thread experience.
   */
  url: string;

  content?: string;

  /**
   * A named identifier used to quickly jump to this item
   */
  anchorName?: string;
}> {
  static type = "threads-embed";
  static vendorPrefix = "offset";
}
