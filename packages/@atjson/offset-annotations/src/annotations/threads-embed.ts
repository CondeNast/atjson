import { BlockAnnotation } from "@atjson/document";

export class ThreadsEmbed extends BlockAnnotation<{
  /**
   * The URL to the Threads post
   */
  url: string;

  /**
   * Content of the Threads post, which allows to store
   * text of the post content if that is wanted.
   */
  content?: string;

  /**
   * A named identifier used to quickly jump to this item
   */
  anchorName?: string;
}> {
  static type = "threads-embed";
  static vendorPrefix = "offset";
}
