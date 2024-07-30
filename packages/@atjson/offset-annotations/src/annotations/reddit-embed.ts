import { BlockAnnotation } from "@atjson/document";

/**
 * Reddit post & comment embeds
 */
export class RedditEmbed extends BlockAnnotation<{
  /**
   * The embed URL
   */
  url: string;

  /**
   * Whether the post's content should be hidden
   */
  hidePostContent?: boolean;

  /**
   * The post's content will be hidden if it has been
   * edited after embedding.
   */
  hidePostContentIfEditedAfter?: string;

  /**
   * For comment embeds, whether the post's title should
   * be displayed.
   */
  showPostTitle?: boolean;

  /**
   * For comment embeds, whether the parent comment should
   * be shown in the thread.
   */
  showParentComment?: boolean;

  /**
   * Whether the username should be blurred.
   */
  hideUsername?: boolean;

  /**
   * The height of the embed
   */
  height: number;

  /**
   * Post contents to store prior to load.
   */
  content?: string;

  /**
   * Layout information, used to indicate mutually
   * exclusive layouts, for example sizes, floats, etc.
   */
  layout?: string;

  /**
   * A named identifier used to quickly jump to this item
   */
  anchorName?: string;
}> {
  static type = "reddit-embed";
  static vendorPrefix = "offset";
}
