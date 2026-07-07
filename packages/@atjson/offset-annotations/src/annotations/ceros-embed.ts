import { BlockAnnotation } from "@atjson/document";

export type CerosStudioEmbedAttributes = {
  /**
   * The type of Ceros experience.
   */
  cerosType?: "studio";

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
};

export type CerosFlexInlineEmbedAttributes = {
  /**
   * The type of Ceros experience.
   */
  cerosType: "flex";

  /**
   * The Flex rendering mode.
   */
  renderMode: "inline";

  /**
   * The manifest URL for the Ceros Flex experience.
   */
  manifestUrl: string;

  /**
   * The client script URL for rendering Ceros Flex experiences.
   */
  scriptUrl?: string;

  /**
   * The inline container height for full-height scrolling Flex experiences.
   */
  height?: string;

  /**
   * Layout information, used to indicate mutually
   * exclusive layouts, for example sizes, floats, etc.
   */
  layout?: string;

  /**
   * A named identifier used to quickly jump to this item
   */
  anchorName?: string;
};

export class CerosEmbed extends BlockAnnotation<
  CerosStudioEmbedAttributes | CerosFlexInlineEmbedAttributes
> {
  static vendorPrefix = "offset";
  static type = "ceros-embed";
}
