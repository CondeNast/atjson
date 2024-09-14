import { BlockAnnotation } from "@atjson/document";

/**
 * A table of content is designed to enhance the usability and navigation of
 * our content. This feature provides users with a structured and accessible
 * way to navigate through various sections of a story, especially long-form
 * articles, improving the overall user experience and engagement. It will
 * make it easier for users to find specific sections or information quickly.
 * It also encourages readers to explore more content by providing them easy
 * access to different parts of our content.
 *
 * It is a way of displaying tabular or database-like data.
 * Table of Content displays data as a list of links that tag to headers that
 * exist in the body of a story.
 *
 */

export class TableOfContent extends BlockAnnotation<{
  /**
   * a header slice to hold header text
   */
  header: string;
  /**
   * content slice to hold list of links
   */
  content: string;
  /**
   * A named identifier used to describe toc's initial state
   */
  isCollapsible?: boolean;
  /**
   * A named identifier used to quickly jump to this item
   */
  anchorName?: string;
  /**
   * Layout information, used to indicate mutually
   * exclusive layouts, for example sizes, floats, etc.
   */
  layout?: string;
}> {
  static type = "table-of-content";
  static vendorPrefix = "offset";
}
