import { BlockAnnotation } from "@atjson/document";

export class CneAudioEmbed extends BlockAnnotation<{
  url: string;
  targetId: string;
}> {
  static vendorPrefix = "offset";
  static type = "cneaudio-embed";
}
