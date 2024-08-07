import { ObjectAnnotation, AttributesOf } from "@atjson/document";
import { Link } from "./link";

export class Image extends ObjectAnnotation<{
  /**
   * The URL to the image.
   */
  url: string;

  /**
   * The title of the image, provided for compatibility
   * with markdown and HTML.
   */
  title?: string;

  /**
   * A description of the image, used for assistive
   * technology to provide information to someone
   * that may need help describing the contents of
   * the image.
   */
  description?: string;

  /**
   * A named identifier used to quickly jump to this item
   */
  anchorName?: string;

  /**
   * Optional link attributes
   */
  link?: AttributesOf<Link>;
}> {
  static vendorPrefix = "offset";
  static type = "image";
}
