import { EdgeBehaviour, InlineAnnotation } from "@atjson/document";

export class Link extends InlineAnnotation<{
  /**
   * The URL of the link.
   */
  url: string;

  /**
   * Optional title of the link, provided for compatibility
   * with markdown and HTML.
   */
  title?: string;

  /**
   * Metadata about the relationship of the link to the current
   * page. This maps directly to the `rel` property on anchor
   * tags in HTML.
   */
  rel?: string;

  /**
   * Maps to the HTML target property on links, which provides
   * control whether a link should open in a new tab or in the
   * same tab.
   */
  target?: string;

  /**
   * A flag to mark a link as an affiliate link.
   */
  isAffiliateLink?: boolean;

  /**
   * A flag to mark a link as generated automatically
   * via a pattern or script.
   */
  isAutogenerated?: boolean;
}> {
  static vendorPrefix = "offset";
  static type = "link";
  static edgeBehaviour = {
    leading: EdgeBehaviour.preserve,
    trailing: EdgeBehaviour.preserve,
  };
}
