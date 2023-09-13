import { BlockAnnotation } from "@atjson/document";

export class List extends BlockAnnotation<{
  /**
   * The type of list— out of the box, atjson
   * understands "bulleted" and "numbered" lists.
   */
  type: string;

  /**
   * Layout information, used to indicate mutually
   * exclusive layouts, for example sizes, floats, etc.
   */
  layout?: string;

  /**
   * Used to specify the delimiter character used
   * for the list if it's a bulleted list.
   */
  delimiter?: string;

  /**
   * This is a markdown feature that has made its way
   * into atjson for full markdown compatibility, indicating
   * that the list items should be wrapped in paragraphs.
   *
   * We don't really recommend this, since it's such a
   * finicky way of managing lists for writers. Not really
   * something that's necessary.
   */
  loose?: boolean;

  /**
   * If this is a numbered list, this indicates what number
   * the list should start at.
   */
  startsAt?: number;

  /**
   * A named identifier used to quickly jump to this item
   */
  anchorName?: string;
}> {
  static vendorPrefix = "offset";
  static type = "list";
}
