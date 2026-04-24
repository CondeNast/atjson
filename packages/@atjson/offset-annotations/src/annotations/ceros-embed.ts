import { BlockAnnotation } from "@atjson/document";

type SharedCerosEmbedAttributes = {
  /**
   * The URL to the Ceros experience.
   */
  url: string;

  /**
   * Layout information, used to indicate mutually
   * exclusive layouts, for example sizes, floats, etc.
   */
  layout?: string;

  /**
   * Accessible title for the generated iframe. For Flex embeds this
   * is sourced from the container's `data-title` attribute.
   */
  title?: string;

  /**
   * A named identifier used to quickly jump to this item
   */
  anchorName?: string;
};

type StudioCerosEmbedAttributes = SharedCerosEmbedAttributes & {
  /**
   * The type of ceros embed.
   */
  cerosType?: "studio";

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
};

type FlexCerosEmbedAttributes = SharedCerosEmbedAttributes & {
  /**
   * The type of ceros embed.
   */
  cerosType: "flex";

  /**
   * The configured width for a Flex embed. Per Ceros docs this is
   * typically a percentage value such as `100%`.
   */
  embedWidth?: string;

  /**
   * The configured height for a Flex embed. Per Ceros docs this is
   * either `auto` for a full-height embed or a fixed pixel value
   * such as `800px` for a scrolling embed.
   */
  embedHeight?: string;
};

export type CerosEmbedAttributes =
  | StudioCerosEmbedAttributes
  | FlexCerosEmbedAttributes;

export class CerosEmbed extends BlockAnnotation<CerosEmbedAttributes> {
  static vendorPrefix = "offset";
  static type = "ceros-embed";
}
