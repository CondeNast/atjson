import { BlockAnnotation } from "@atjson/document";

export enum AudioEnvironments {
  Production = "production",
  Sandbox = "sandbox",
}

export class CneAudioEmbed extends BlockAnnotation<{
  audioEnv: AudioEnvironments;
  audioType: string;
  audioId: string;
  anchorName: string;
}> {
  static vendorPrefix = "offset";
  static type = "cne-audio-embed";
}
