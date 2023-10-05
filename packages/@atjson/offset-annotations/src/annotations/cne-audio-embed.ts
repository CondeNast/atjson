import { BlockAnnotation } from "@atjson/document";

export enum AudioEnvironments {
  Production = "production",
  Sandbox = "sandbox",
}

export const CneAudioEnvironments = {
  [AudioEnvironments.Production]: `https://embed-audio.cnevids.com`,
  [AudioEnvironments.Sandbox]: `https://embed-audio-sandbox.cnevids.com`,
};

export class CneAudioEmbed extends BlockAnnotation<{
  audioEnv: AudioEnvironments;
  audioType: string;
  audioId: string;
  anchorName: string;
}> {
  static vendorPrefix = "offset";
  static type = "cne-audio-embed";
}
