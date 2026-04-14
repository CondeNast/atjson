import { BlockAnnotation } from "@atjson/document";

export class CerosEmbed extends BlockAnnotation<{
  /**
   * The URL to the Ceros experience.
   */
  url: string;

  /**
   * The type of ceros embed.
   */
  cerosType?: "studio" | "flex";

  /**
   * The URL to the Flex experience when represented separately
   * from the canonical `url` field.
   */
  experienceUrl?: string;

  /**
   * The script URL required to bootstrap a Flex embed.
   */
  scriptUrl?: string;

  /**
   * The configured width for a Flex embed.
   */
  width?: string;

  /**
   * The configured height for a Flex embed.
   */
  height?: string;

  /**
   * The aspect ratio, as a fraction of the embed, which
   * is used so the embed can be scaled automatically
   * by the Ceros script tag.
   */
  aspectRatio?: number;

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
