import { BlockAnnotation } from "@atjson/document";

export interface AudioEnvironments {
  production: string;
  sandbox: string;
}

const isCneAudioProduction = (hostname: string): boolean => {
  return /embed-audio\.cnevids\.com/.test(hostname);
};

const isCneAudioSandbox = (hostname: string): boolean => {
  return /embed-audio-sandbox\.cnevids\.com/.test(hostname);
};

export const getCneAudioEnvironment = (
  hostname: string
): keyof AudioEnvironments => {
  if (isCneAudioProduction(hostname)) return "production";
  if (isCneAudioSandbox(hostname)) return "sandbox";

  return "production";
};

export const CneAudioEnvironments: AudioEnvironments = {
  production: `https://embed-audio.cnevids.com`,
  sandbox: `https://embed-audio-sandbox.cnevids.com`,
};

export class CneAudioEmbed extends BlockAnnotation<{
  audioEnv: keyof AudioEnvironments;
  audioType: string;
  audioId: string;
  anchorName: string;
}> {
  static vendorPrefix = "offset";
  static type = "cne-audio-embed";
}
