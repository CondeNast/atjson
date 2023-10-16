import { BlockAnnotation } from "@atjson/document";

export enum AudioEnvironments {
  Production = "production",
  Sandbox = "sandbox",
}

export class CneAudioEmbed extends BlockAnnotation<{
  /**
   * Indicates the environment that the audio was published in.
   */
  audioEnv: AudioEnvironments;

  /**
   * The type of audio embed.
   */
  audioType: string;

  /**
   * The unique id of the audio, used to embed the
   * podcast / episode / etc.
   */
  audioId: string;

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
  static type = "cne-audio-embed";
}
