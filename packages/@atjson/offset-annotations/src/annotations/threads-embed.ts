import { BlockAnnotation } from "@atjson/document";

export class ThreadsEmbed extends BlockAnnotation<{
  /**
   * The URL to the Thread experience.
   */
  url: string;

  content?: string;

  /**
   * Name of the account
   */
  username?: string;

  /**
   * Id of the Threads post
   */
  postId?: string;
}> {
  static type = "threads-embed";
  static vendorPrefix = "offset";
}
