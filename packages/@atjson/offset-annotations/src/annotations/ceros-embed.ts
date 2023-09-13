import { BlockAnnotation } from "@atjson/document";

export class CerosEmbed extends BlockAnnotation<{
  /**
   * The URL to the Ceros experience.
   */
  url: string;

  /**
   * The aspect ratio, as a fraction of the embed, which
   * is used so the embed can be scaled automatically
   * by the Ceros script tag.
   */
  aspectRatio: number;

  /**
   * The mobile aspect ratio of the embed, which is chosen
   * by Ceros when on smaller screen sizes.
   */
  mobileAspectRatio?: number;

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
  static vendorPrefix = "offset";
  static type = "ceros-embed";
}
